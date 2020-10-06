import type { RouterContext } from "oak";
import Ajv from "ajv";
import {
  create,
  findById,
  getAll,
  getTableData,
} from "../../../api/models/files/template.ts";
import { TRUTHY_INTEGER } from "../../../lib/ajv/types.js";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { Message } from "../../http_utils.ts";

const update_request = {
  $id: "update",
  properties: {
    "format": TRUTHY_INTEGER,
    "name": {
      maxLength: 50,
      type: "string",
    },
    "prefix": {
      maxLength: 50,
      pattern: "^\\w+$",
      type: "string",
    },
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "format",
    "name",
    "prefix",
  ],
});

//@ts-ignore
const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const getSupportFormats = async ({ response }: RouterContext) => {
  response.body = await getAll();
};

export const getSupportFormatsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createSupportFormat = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await create(
    value.format,
    value.name,
    value.prefix.toUpperCase(),
  );
};

export const getSupportFormat = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const template = await findById(id);
  if (!template) throw new NotFoundError();

  response.body = template;
};

export const updateSupportFormat = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let template = await findById(id);
  if (!template) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await template.update(
    value.name,
  );
};

export const deleteSupportFormat = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let template = await findById(id);
  if (!template) throw new NotFoundError();

  await template.delete();

  response.body = Message.OK;
};
