import Ajv from "ajv";
import { decodeToken } from "../../lib/jwt.ts";
import type { RouterContext } from "oak";
import {
  createNew,
  findById,
  getTableData,
} from "../../api/models/OPERACIONES/asignacion_solicitud.ts";
import {
  createNew as createAssignation,
} from "../../api/models/OPERACIONES/asignacion.ts";
import {
  findOpenWeek as findOpenWeekOfPerson,
} from "../../api/models/OPERACIONES/control_semana.ts";
import {
  findByDate as findWeekByDate,
  findById as findWeekById,
  getCurrentWeek,
} from "../../api/models/MAESTRO/dim_semana.ts";
import {
  findById as findBudget,
  findOpenBudgetByProject as findBudgetByProject,
} from "../../api/models/OPERACIONES/budget.ts";
import {
  findById as findProject,
} from "../../api/models/OPERACIONES/PROYECTO.ts";
import {
  dispatchAssignationRequested as sendAssignationRequestEmail,
  dispatchAssignationRequestReviewed as sendAssignationRequestReviewEmail,
} from "../../api/email/dispatchers.js";
import { Profiles } from "../../api/common/profiles.ts";
import { NotFoundError, RequestSyntaxError } from "../exceptions.ts";
import {
  BOOLEAN,
  STRING,
  TRUTHY_INTEGER,
  UNSIGNED_NUMBER,
} from "../../lib/ajv/types.js";
import {
  parseStandardNumber,
} from "../../lib/date/mod.js";
import {
  castStringToBoolean,
} from "../../lib/utils/boolean.js";

const post_structure = {
  $id: "post",
  properties: {
    "project": TRUTHY_INTEGER,
    "role": TRUTHY_INTEGER,
    "date": {
      type: ["number", "string"],
    },
    "hours": UNSIGNED_NUMBER,
    "description": STRING(255),
  },
  required: [
    "project",
    "role",
    "date",
    "hours",
    "description",
  ],
};

const put_structure = {
  $id: "put",
  if: {
    properties: {
      "approved": {
        const: false,
      },
    },
  },
  then: {
    required: [
      "reason",
    ],
  },
  properties: {
    "approved": BOOLEAN,
    "reason": STRING(255),
  },
  required: [
    "approved",
  ],
};

const request_validator = new Ajv({
  schemas: [
    post_structure,
    put_structure,
  ],
});

export const createAssignationRequest = async (
  { params, request, response }: RouterContext<{ person: string }>,
) => {
  const person = Number(params.person);
  if (!person || !request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  const parsed_date = parseStandardNumber(Number(value.date));

  if (
    !request_validator.validate("post", value) ||
    !parsed_date
  ) {
    throw new RequestSyntaxError();
  }

  const budget = await findBudgetByProject(Number(value.project));
  if (!budget || !budget.estado) {
    throw new Error(
      "No existe un presupuesto abierto para el projecto seleccionado",
    );
  }

  const open_control = await findOpenWeekOfPerson(
    person,
  );
  if (!open_control) {
    throw new RequestSyntaxError(
      "La persona solicitada no se encuentra habilitada para registrar horas",
    );
  }

  const control_week = await findWeekById(open_control.week);
  const current_week = await getCurrentWeek();

  if(!control_week){
    throw new Error("No fue posible calcular la semana de registro solicitada");
  }

  if (
    (parsed_date as Date).getTime() > current_week.end_date.getTime() + ((1000 * 60 * 60 * 24) - 1)
    ||
    (parsed_date as Date).getTime() < control_week.start_date.getTime()
  ) {
    throw new RequestSyntaxError(
      "Debe solicitar una fecha superior a la semana registrada y la semana que esta siendo cursada",
    );
  }

  const assignation_request = await createNew(
    person,
    budget.pk_presupuesto,
    Number(value.role),
    Number(value.date),
    Number(value.hours),
    value.description,
  );

  await sendAssignationRequestEmail(assignation_request.id)
    .catch((e) => {
      throw new Error("No fue posible enviar el correo de solicitud");
    });

  response.body = assignation_request;
};

export const updateAssignationRequest = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id || !request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("put", value)) {
    throw new RequestSyntaxError();
  }

  const assignation_request = await findById(id);
  if (!assignation_request) throw new NotFoundError();

  const approved = typeof value.approved === "string"
    ? castStringToBoolean(value.approved)
    : value.approved;

  if (approved) {
    const budget_data = await findBudget(assignation_request.budget);
    if (!budget_data) {
      throw new NotFoundError("El presupuesto seleccionado no existe");
    }
    if (!budget_data.estado) {
      throw new Error(
        "El presupuesto para esta asignacion se encuentra cerrado",
      );
    }

    //Ignore cause this is already validated but TypeScript is too dumb to notice
    const session_cookie = cookies.get("PA_AUTH") || "";
    const {
      id: user_id,
      profiles: user_profiles,
    } = await decodeToken(session_cookie);

    const project_data = await findProject(budget_data.fk_proyecto);
    if (!project_data) {
      throw new NotFoundError("El proyecto seleccionado no existe");
    }
    const allowed_editors = await project_data.getSupervisors();
    if (!allowed_editors.includes(user_id)) {
      if (
        !user_profiles.some((profile: number) =>
          [
            Profiles.ADMINISTRATOR,
            Profiles.CONTROLLER,
          ].includes(profile)
        )
      ) {
        throw new Error(
          "Usted no tiene permiso para asignar sobre este proyecto",
        );
      }
    }

    const week = await findWeekByDate(assignation_request.date);
    if (!week) {
      throw new Error("La fecha de la solicitud es inválida");
    }

    await createAssignation(
      assignation_request.person,
      assignation_request.budget,
      assignation_request.role,
      week.id,
      assignation_request.date,
      assignation_request.hours,
    );
  }

  await sendAssignationRequestReviewEmail(
    assignation_request.id,
    approved,
    value.reason,
  )
    .catch(() => {
      throw new Error("No fue posible enviar el correo de confirmación");
    });

  await assignation_request.delete();

  response.body = { approved };
};

export const getAssignationRequestTable = async (
  { params, response }: RouterContext<{ person: string }>,
) => {
  const person = Number(params.person);
  if (!person) throw new RequestSyntaxError();

  response.body = await getTableData(person);
};
