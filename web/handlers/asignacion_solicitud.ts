import Ajv from "ajv";
import { RouterContext, Body } from "oak";
import {
  createNew,
} from "../../api/models/ORGANIZACION/asignacion_solicitud.ts";
import {
  findByProject as findBudgetByProject,
} from "../../api/models/OPERACIONES/PRESUPUESTO.ts";
import { RequestSyntaxError } from "../exceptions.ts";
import {
  TRUTHY_INTEGER,
  UNSIGNED_NUMBER,
} from "../../lib/ajv/types.js";
import {
  parseStandardNumber,
} from "../../lib/date/mod.js";

const structure = {
  $id: "request",
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

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    structure,
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
    type !== "json" || !request_validator.validate("request", value) ||
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
