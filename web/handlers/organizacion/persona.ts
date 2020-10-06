import { helpers } from "oak";
import type { RouterContext } from "oak";
import {
  PostgresError,
} from "deno_postgres/error.ts";
import Ajv from "ajv";
import {
  create,
  getAll,
  findById,
  getTableData,
  TipoIdentificacion,
} from "../../../api/models/ORGANIZACION/people.ts";
import { Message } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import {
  BOOLEAN,
  EMAIL,
  STANDARD_DATE_STRING,
  STANDARD_DATE_STRING_OR_NULL,
  STRING,
} from "../../../lib/ajv/types.js";
import {
  castStringToBoolean,
} from "../../../lib/utils/boolean.js";

const list_request = {
  $id: "list",
  properties: {
    "list_retired": BOOLEAN,
  },
};

const update_request = {
  $id: "update",
  properties: {
    "email": EMAIL,
    "identification": STRING(15),
    "name": STRING(255),
    "phone": STRING(20),
    "retirement_date": STANDARD_DATE_STRING_OR_NULL,
    "start_date": STANDARD_DATE_STRING,
    "type": STRING(
      undefined,
      undefined,
      Object.values(TipoIdentificacion),
    ),
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "email",
    "identification",
    "name",
    "phone",
    "type",
    "start_date",
  ],
});

const request_validator = new Ajv({
  schemas: [
    create_request,
    list_request,
    update_request,
  ],
});

export const createPerson = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await create(
    value.type,
    value.identification,
    value.name,
    value.phone,
    value.email,
    value.start_date,
  );
};
export const deletePerson = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let person = await findById(id);
  if (!person) throw new NotFoundError();

  await person.delete()
    .catch((e) => {
      if (e instanceof PostgresError && e.fields.constraint) {
        throw new Error(
          'La persona seleccionada esta siendo utilizada dentro del sistema. Por favor utilize el campo de "Fecha retiro" para retirarla del sistema seguramente',
        );
      } else {
        throw new Error(
          "No fue posible eliminar a la persona",
        );
      }
    });
  response.body = Message.OK;
};

export const getPeople = async (ctx: RouterContext) => {
  const query_params = helpers.getQuery(ctx);

  if (!request_validator.validate("list", query_params)) {
    throw new RequestSyntaxError();
  }

  //Secretly clever
  ctx.response.body = await getAll(
    query_params.list_retired
      ? castStringToBoolean(query_params.list_retired)
      : false,
  );
};

export const getPeopleTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const getPerson = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const person = await findById(id);
  if (!person) throw new NotFoundError();

  response.body = person;
};

export const updatePerson = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let person = await findById(id);
  if (!person) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await person.update(
    value.type,
    value.identification,
    undefined,
    undefined,
    value.name,
    value.phone,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    value.start_date,
    value.retirement_date,
  )
    .catch((e) => {
      throw new Error(
        "No fue posible actualizar a la persona",
      );
    });
};
