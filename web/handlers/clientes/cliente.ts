import { helpers, RouterContext } from "oak";
import Ajv from "ajv";
import {
  create,
  findById,
  getAll,
  getTableData,
} from "../../../api/models/CLIENTES/CLIENTE.ts";
import { Message } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { BOOLEAN, TRUTHY_INTEGER } from "../../../lib/ajv/types.js";
import { castStringToBoolean } from "../../../lib/utils/boolean.js";
import { decodeToken } from "../../../lib/jwt.ts";

const list_request = {
  $id: "list",
  properties: {
    "assignated_only": BOOLEAN,
  },
};

const update_request = {
  $id: "update",
  properties: {
    "address": {
      maxLength: 100,
      type: "string",
    },
    "business": {
      maxLength: 255,
      type: "string",
    },
    "city": TRUTHY_INTEGER,
    "name": {
      maxLength: 255,
      type: "string",
    },
    "nit": {
      maxLength: 64,
      type: "string",
    },
    "sector": TRUTHY_INTEGER,
    "verification_digit": {
      minimum: 0,
      maximum: 9,
      pattern: "^[0-9]$",
      type: ["string", "number"],
    },
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  "required": [
    "address",
    "business",
    "city",
    "name",
    "nit",
    "sector",
    "verification_digit",
  ],
});

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    create_request,
    list_request,
    update_request,
  ],
});

export const getClients = async (context: RouterContext) => {
  const session_cookie = context.cookies.get("PA_AUTH") || "";
  const { id } = await decodeToken(session_cookie);
  const url_params = helpers.getQuery(context);

  if (!request_validator.validate("list", url_params)) {
    throw new RequestSyntaxError();
  }

  context.response.body = await getAll(
    castStringToBoolean(url_params.assignated_only ?? false),
    id,
  );
};

export const getClientsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createClient = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await create(
    value.sector,
    value.name,
    value.nit,
    value.verification_digit,
    value.business,
    value.city,
    value.address,
  );
};

export const getClient = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const client = await findById(id);
  if (!client) throw new NotFoundError();

  response.body = client;
};

export const updateClient = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let client = await findById(id);
  if (!client) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await client.update(
    value.sector,
    value.name,
    value.nit,
    value.verification_digit,
    value.business,
    value.city,
    value.address,
  );
};

export const deleteClient = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let client = await findById(id);
  if (!client) throw new NotFoundError();

  await client.delete();

  response.body = Message.OK;
};
