import { Status } from "oak";
import type { RouterContext } from "oak";
import Ajv from "ajv";
import {
  createNew,
  findById,
  getAll,
  getRegistryHoursByControlWeek as getWeekRegistry,
  getTableData,
} from "../../api/models/OPERACIONES/registro.ts";
import {
  createNewControl,
  findOpenWeek,
  getOpenWeekAsDate,
  validateWeek,
} from "../../api/models/OPERACIONES/control_semana.ts";
import { findById as findWeek } from "../../api/models/MAESTRO/dim_semana.ts";
import {
  getAssignationHoursByWeek as getWeekAssignation,
} from "../../api/models/OPERACIONES/asignacion.ts";
import {
  getPersonRequestedHoursByWeek as getWeekRequests,
} from "../../api/models/OPERACIONES/asignacion_solicitud.ts";
import { NotFoundError, RequestSyntaxError } from "../exceptions.ts";
import {
  BOOLEAN,
  TRUTHY_INTEGER,
  UNSIGNED_NUMBER,
} from "../../lib/ajv/types.js";
import { decodeToken } from "../../lib/jwt.ts";
import { castStringToBoolean } from "../../lib/utils/boolean.js";

const close_request = {
  $id: "close",
  properties: {
    "overflow": BOOLEAN,
  },
};

const post_structure = {
  $id: "post",
  properties: {
    "control": {
      minimum: 1,
      pattern: "^[0-9]+$|^null$",
      type: ["string", "number", "null"],
    },
    "budget": TRUTHY_INTEGER,
    "role": TRUTHY_INTEGER,
    "hours": UNSIGNED_NUMBER,
  },
  required: [
    "control",
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
  schemas: [
    close_request,
    post_structure,
    put_structure,
  ],
});

export const getWeeksDetail = async ({ response }: RouterContext) => {
  response.body = await getAll();
};

export const getWeekDetail = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const detail = await findById(id);
  if (!detail) throw new NotFoundError();

  response.body = detail;
};

export const getWeekInformation = async (
  { cookies, response }: RouterContext,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  const week_information: {
    assignated_hours: number;
    date: number;
    executed_hours: number;
    expected_hours: number;
    is_current_week: boolean | null;
    requested_hours: number;
  } = {
    assignated_hours: 0,
    date: 20001231,
    executed_hours: 0,
    expected_hours: 0,
    is_current_week: null,
    requested_hours: 0,
  };

  const control_week = await findOpenWeek(user_id);
  if (control_week) {
    const week = await findWeek(control_week.week);
    if (!week) {
      throw new NotFoundError("Semana de registro no encontrada");
    }
    week_information.assignated_hours = await getWeekAssignation(
      user_id,
      week.id,
    );
    week_information.date = await week.getStartDate();
    week_information.executed_hours = await getWeekRegistry(control_week.id);
    week_information.expected_hours = await week.getLaboralHours();
    week_information.is_current_week = await week.isCurrentWeek();
    week_information.requested_hours = await getWeekRequests(
      user_id,
      control_week.week,
    );
  } else {
    week_information.date = await getOpenWeekAsDate(user_id);
  }

  response.body = week_information;
};

export const getWeekDetailTable = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  response.body = await getTableData(id);
};

export const createWeekDetail = async (
  { params, request, response }: RouterContext<{ person: string }>,
) => {
  const person: number = Number(params.person);
  if (!person) throw new RequestSyntaxError();
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (
    !request_validator.validate("post", value)
  ) {
    throw new RequestSyntaxError();
  }

  let control: number;
  if (String(value.control) === "null") {
    control = await createNewControl(
      person,
    ).then((week_control) => week_control.id);
  } else {
    control = Number(value.control);
  }

  response.body = await createNew(
    control,
    Number(value.budget),
    Number(value.role),
    Number(value.hours),
  );
};

export const updateWeekDetail = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (
    !request_validator.validate("put", value)
  ) {
    throw new RequestSyntaxError();
  }

  let detail = await findById(id);
  if (!detail) throw new NotFoundError();

  response.body = await detail.update(
    Number(value.hours),
  );
};

export const closePersonWeek = async (
  { params, request, response }: RouterContext<{ person: string }>,
) => {
  const person = Number(params.person);
  if (!person) throw new RequestSyntaxError();

  const week = await findOpenWeek(person);
  if (!week) throw new NotFoundError("No existen registros en esta semana");

  const value = await request.body({ type: "json" }).value;
  if (!request_validator.validate("close", value)) {
    throw new RequestSyntaxError();
  }

  const allow_week_overflow = castStringToBoolean(value.overflow ?? false);
  const validation = await validateWeek(week.person, week.week);

  if (validation) {
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
    } else if (!validation.assignation_completed) {
      throw new RequestSyntaxError(
        "REGISTRY_ASSIGNATION_NOT_COMPLETED",
        "No cumplio con el minimo de horas asignadas",
      );
    }

    if (validation.week_overflowed && !allow_week_overflow) {
      response.status = Status.Accepted;
      response.body = {
        code: "REGISTRY_WEEK_OVERFLOWED",
        message: "Las horas registradas exceden la asignación semanal",
      };
      return;
    }
    //If validation passes then close week
  }

  response.body = await week.close();
};
