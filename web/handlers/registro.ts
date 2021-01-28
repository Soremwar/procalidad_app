import { helpers, Status } from "oak";
import { RouterContext } from "../state.ts";
import Ajv from "ajv";
import {
  create as createRegistry,
  findByIdentifiers,
  getCurrentWeekData,
  getRegistryHoursByControlWeek as getWeekRegistry,
  getWeekData,
} from "../../api/models/OPERACIONES/registro.ts";
import {
  create as createRegistryLog,
} from "../../api/models/OPERACIONES/registry_log.ts";
import {
  findByPersonAndWeek,
  findOpenWeek,
  getOpenWeekAsDate,
  validateWeek,
} from "../../api/models/OPERACIONES/control_semana.ts";
import {
  findById as findWeek,
  getWeeksBetween,
} from "../../api/models/MAESTRO/dim_semana.ts";
import {
  getAssignationHoursByWeek as getWeekAssignation,
} from "../../api/models/OPERACIONES/asignacion.ts";
import {
  findByPersonAndWeek as findAssignationRequest,
  getPersonRequestedHoursByWeek as getWeekRequests,
} from "../../api/models/OPERACIONES/asignacion_solicitud.ts";
import {
  findByControl as findCloseRequest,
} from "../../api/models/OPERACIONES/early_close_request.ts";
import {
  ForbiddenAccessError,
  NotFoundError,
  RequestSyntaxError,
} from "../exceptions.ts";
import {
  BOOLEAN,
  INTEGER,
  STRING,
  TRUTHY_INTEGER,
  UNSIGNED_NUMBER,
} from "../../lib/ajv/types.js";
import { formatDateToStandardString } from "../../lib/date/mod.js";
import { Profiles } from "../../api/common/profiles.ts";

//TODO
//person and week should be mutually mandatory
//Reason should be mandatory if person and week are provided
const close_request = {
  $id: "close",
  properties: {
    "overflow": BOOLEAN,
    "person": INTEGER({ min: 0 }),
    "registry": {
      items: {
        properties: {
          "budget": INTEGER({ min: 0 }),
          "hours": INTEGER({ min: 0 }),
          "role": INTEGER({ min: 0 }),
          "reason": STRING(100),
        },
        required: [
          "budget",
          "hours",
          "role",
        ],
        type: "object",
      },
      type: "array",
    },
    "week": INTEGER({ min: 0 }),
  },
  required: [
    "registry",
  ],
};

const list_request = {
  $id: "list",
  properties: {
    "persona": INTEGER({ min: 1 }),
    "semana": INTEGER({ min: 1 }),
  },
  required: [
    "persona",
    "semana",
  ],
};

const post_structure = {
  $id: "post",
  properties: {
    "budget": TRUTHY_INTEGER,
    "role": TRUTHY_INTEGER,
    "hours": UNSIGNED_NUMBER,
  },
  required: [
    "week_control",
    "budget",
    "role",
    "hours",
  ],
};

const put_structure = {
  $id: "put",
  properties: {
    "hours": UNSIGNED_NUMBER,
  },
  required: [
    "hours",
  ],
};

const request_validator = new Ajv({
  coerceTypes: true,
  schemas: [
    close_request,
    list_request,
    post_structure,
    put_structure,
  ],
});

export const closePersonWeek = async (
  { request, response, state }: RouterContext<{ person: string }>,
) => {
  const value: {
    overflow: boolean;
    person?: number;
    registry: Array<{
      budget: number;
      role: number;
      hours: number;
      reason?: string;
    }>;
    week?: number;
  } = await request.body({ type: "json" }).value;
  if (!request_validator.validate("close", value)) {
    throw new RequestSyntaxError();
  }

  const is_admin_request = !!(value.person && value.week);

  let person;
  let week_control;
  if (value.person && value.week) {
    const has_access = state.user.profiles.some((profile) =>
      [
        Profiles.ADMINISTRATOR,
        Profiles.CONTROLLER,
        Profiles.HUMAN_RESOURCES,
      ].includes(profile)
    );

    if (!has_access) {
      throw new ForbiddenAccessError();
    }

    person = value.person;
    week_control = await findByPersonAndWeek(person, value.week);
  } else {
    person = state.user.id;
    week_control = await findOpenWeek(person);
  }

  if (!week_control) {
    throw new NotFoundError("No existen registros en esta semana");
  }

  const validation = await validateWeek(
    person,
    week_control.week,
    value.registry,
  );

  // TODO
  // El usuario no se le debe permitir solicitar el cerrado
  // de la semana anticipadamente
  if (!validation.week_completed) {
    throw new RequestSyntaxError(
      "REGISTRY_WEEK_NOT_COMPLETED",
      "Las horas registradas no coinciden con el esperado semanal",
    );
  } else if (!validation.time_completed) {
    throw new RequestSyntaxError(
      "REGISTRY_WEEK_ON_GOING",
      "La semana a cerrar aun se encuentra en curso",
    );
  } else if (validation.assignation_overflowed) {
    throw new RequestSyntaxError(
      "REGISTRY_ASSIGNATION_OVERFLOWED",
      "Las horas registradas exceden su asignación",
    );
  }

  const allow_week_overflow = value.overflow;
  if (validation.week_overflowed && !allow_week_overflow) {
    response.status = Status.Accepted;
    response.body = {
      code: "REGISTRY_WEEK_OVERFLOWED",
      message: "Las horas registradas exceden la asignación semanal",
    };
    return;
  }

  for (const registry of value.registry) {
    const prev_registry = await findByIdentifiers(
      week_control.id,
      registry.budget,
      registry.role,
    );

    let updated_registry;
    if (prev_registry) {
      updated_registry = await prev_registry.update(registry.hours);
    } else {
      updated_registry = await createRegistry(
        week_control.id,
        registry.budget,
        registry.role,
        registry.hours,
      );
    }

    if (is_admin_request) {
      await createRegistryLog(
        updated_registry.id,
        state.user.id,
        registry.reason || "",
      );
    }
  }

  // Cleanup open requests only if it's the owner of these requests
  // who is requesting the week close
  if (!is_admin_request) {
    const assignation_requests = await findAssignationRequest(
      week_control.person,
      week_control.week,
    );

    for (const request of assignation_requests) {
      await request.delete();
    }

    const close_request = await findCloseRequest(week_control.id);
    if (close_request) {
      await close_request.delete();
    }
  }

  //Don't open a new week if registered in admin mode
  response.body = await week_control.close(!is_admin_request);
};

export const getRegistrableWeeks = async ({
  params,
  response,
}: RouterContext<{ person: string }>) => {
  const person = Number(params.person);
  if (!person) {
    throw new RequestSyntaxError();
  }

  const control = await findOpenWeek(person);
  if (!control) {
    throw new NotFoundError(
      "La persona solicitada no tiene ninguna semana abierta",
    );
  }
  const week = await findWeek(control.week);
  if (!week) {
    throw new NotFoundError("Semana de registro no encontrada");
  }

  const start_date = new Date(week.start_date.getTime());
  start_date.setMonth(week.start_date.getMonth() - 2);

  response.body = await getWeeksBetween(
    formatDateToStandardString(start_date),
    formatDateToStandardString(week.start_date),
  );
};

export const getWeekDetailTable = async (
  ctx: RouterContext<{ id: string }>,
) => {
  const query = Object.fromEntries(
    Object.entries(helpers.getQuery(ctx)).map((
      [key, value],
    ) => [key, Number(value)]),
  );

  if (request_validator.validate("list", query)) {
    const has_access = ctx.state.user.profiles.some((profile) =>
      [
        Profiles.ADMINISTRATOR,
        Profiles.CONTROLLER,
        Profiles.HUMAN_RESOURCES,
      ].includes(profile)
    );

    if (!has_access) {
      throw new ForbiddenAccessError();
    }
    ctx.response.body = await getWeekData(query.persona, query.semana);
    return;
  }

  ctx.response.body = await getCurrentWeekData(ctx.state.user.id);
};

export const getWeekInformation = async (
  { response, state }: RouterContext,
) => {
  const week_information: {
    assignated_hours: number;
    date: number;
    executed_hours: number;
    expected_hours: number;
    id: number | null;
    is_current_week: boolean | null;
    requested_hours: number;
  } = {
    assignated_hours: 0,
    date: 20001231,
    executed_hours: 0,
    expected_hours: 0,
    id: null,
    is_current_week: null,
    requested_hours: 0,
  };

  const control_week = await findOpenWeek(state.user.id);
  if (control_week) {
    const week = await findWeek(control_week.week);
    if (!week) {
      throw new NotFoundError("Semana de registro no encontrada");
    }
    week_information.assignated_hours = await getWeekAssignation(
      state.user.id,
      week.id,
    );
    week_information.date = await week.getStartDate();
    week_information.executed_hours = await getWeekRegistry(control_week.id);
    week_information.expected_hours = await week.getLaboralHours();
    week_information.id = control_week.week;
    week_information.is_current_week = await week.isCurrentWeek();
    week_information.requested_hours = await getWeekRequests(
      state.user.id,
      control_week.week,
    );
  } else {
    week_information.date = await getOpenWeekAsDate(state.user.id);
  }

  response.body = week_information;
};
