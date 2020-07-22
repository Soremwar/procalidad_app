import Ajv from "ajv";
import { RouterContext, Body } from "oak";
import {
  createNew,
  findById,
  getTableData,
} from "../../api/models/OPERACIONES/asignacion_solicitud.ts";
import {
  createNew as createAssignation,
} from "../../api/models/OPERACIONES/asignacion.ts";
import {
  findById as findWeekControl,
  findByPersonAndDate as findWeekControlByPersonAndDate,
} from "../../api/models/OPERACIONES/control_semana.ts";
import {
  createNew as createRegistry,
} from "../../api/models/OPERACIONES/registro.ts";
import {
  findByProject as findBudgetByProject,
} from "../../api/models/OPERACIONES/budget.ts";
import { NotFoundError, RequestSyntaxError } from "../exceptions.ts";
import {
  BOOLEAN,
  TRUTHY_INTEGER,
  UNSIGNED_NUMBER,
} from "../../lib/ajv/types.js";
import {
  parseStandardNumber,
  parseDateToStandardNumber,
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
    "description": {
      maxLength: 255,
      type: "string",
    },
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
  properties: {
    "approved": BOOLEAN,
  },
  required: [
    "approved",
  ],
};

// @ts-ignore
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

  const {
    type,
    value,
  }: Body = await request.body();

  if (
    type !== "json" || !request_validator.validate("post", value) ||
    !parseStandardNumber(Number(value.date))
  ) {
    throw new RequestSyntaxError();
  }

  const budget = await findBudgetByProject(Number(value.project));
  if (!budget || !budget.estado) {
    throw new Error(
      "No existe un presupuesto abierto para el projecto seleccionado",
    );
  }

  const control = await findWeekControlByPersonAndDate(
    person,
    Number(value.date),
  );
  if (!control) throw new NotFoundError("La semana solicitada no existe");
  if (control.closed) {
    throw new Error(
      "La semana requerida para la solicitud se encuentra cerrada",
    );
  }

  response.body = await createNew(
    control.id,
    budget.pk_presupuesto,
    Number(value.role),
    Number(value.date),
    Number(value.hours),
    value.description,
  );
};

export const updateAssignationRequest = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id || !request.hasBody) throw new RequestSyntaxError();

  const {
    type,
    value,
  }: Body = await request.body();

  if (type !== "json" || !request_validator.validate("put", value)) {
    throw new RequestSyntaxError();
  }

  const assignation_request = await findById(id);
  if (!assignation_request) throw new NotFoundError();

  const control = await findWeekControl(assignation_request.control);
  //Shouldn't happen cause of constraints
  if (!control) throw new NotFoundError("La semana solicitada no existe");
  if (control.closed) {
    throw new Error(
      "La semana especificada para la solicitud ya se encuentra cerrada",
    );
  }

  const approved = typeof value.approved === "string"
    ? castStringToBoolean(value.approved)
    : value.approved;

  if (approved) {
    await createAssignation(
      control.person,
      assignation_request.budget,
      assignation_request.role,
      assignation_request.date,
      assignation_request.hours,
    );
  }

  await assignation_request.delete();
  response.body = { approved };
};

export const getAssignationRequestTable = async (
  { response }: RouterContext,
) => {
  response.body = await getTableData();
};
