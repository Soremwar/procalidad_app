import Ajv from "ajv";
import { RouterContext, Body } from "oak";
import {
  createNew,
  findById,
  getTableData,
} from "../../api/models/ORGANIZACION/asignacion_solicitud.ts";
import {
  createNew as createAssignation,
} from "../../api/models/asignacion/asignacion.ts";
import {
  WeekControl,
  findByPersonAndDate as findWeekControl,
} from "../../api/models/ORGANIZACION/control_cierre_semana.ts";
import {
  createNew as createRegistry,
} from "../../api/models/ORGANIZACION/registro_detalle.ts";
import {
  findByProject as findBudgetByProject,
} from "../../api/models/OPERACIONES/PRESUPUESTO.ts";
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
  if (!budget) {
    throw new Error(
      "No existe un presupuesto abierto para el projecto seleccionado",
    );
  }

  response.body = await createNew(
    person,
    budget.pk_presupuesto,
    Number(value.role),
    parseStandardNumber(Number(value.date)) as Date,
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

  const approved = typeof value.approved === "string"
    ? castStringToBoolean(value.approved)
    : value.approved;

  if (approved) {
    const request_date = parseDateToStandardNumber(assignation_request.date);
    //Save assignation so in case registry fails we are able to revert it
    const assignation = await createAssignation(
      assignation_request.person,
      assignation_request.budget,
      assignation_request.role,
      request_date,
      assignation_request.hours,
    );

    //Will always be a match cause assignation creation would fail otherwise
    //@ts-ignore
    const week: WeekControl = await findWeekControl(
      assignation_request.person,
      request_date,
    )
      .catch(async () => await assignation.delete());

    await createRegistry(
      week.id,
      assignation_request.budget,
      assignation_request.role,
      assignation_request.hours,
    ).catch(async () => await assignation.delete());
  }

  await assignation_request.delete();
  response.body = { approved };
};

export const getAssignationRequestTable = async (
  { response }: RouterContext,
) => {
  response.body = await getTableData();
};
