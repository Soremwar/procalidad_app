import type { RouterContext } from "oak";
import Ajv from "ajv";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/files/asset.ts";
import { Message } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import {
  TRUTHY_INTEGER,
} from "../../../lib/ajv/types.js";

const put_request = {
  $id: "put",
  properties: {
    "name": {
      maxLength: 50,
      type: "string",
    },
    "path": {
      maxLength: 100,
      pattern: "^\\w+$",
      type: "string",
    },
    "size": TRUTHY_INTEGER,
    "extensions": {
      items: {
        maxLength: 10,
        type: "string",
      },
      minItems: 1,
      uniqueItems: true,
    },
  },
};

const post_request = Object.assign({}, put_request, {
  $id: "post",
  required: [
    "name",
    "path",
    "size",
    "extensions",
  ],
});

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    post_request,
    put_request,
  ],
});

export const getFormats = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getFormat = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const acceso = await findById(id);
  if (!acceso) throw new NotFoundError();

  response.body = acceso;
};

export const getFormatsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createFormat = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (
    !request_validator.validate("post", value)
  ) {
    throw new RequestSyntaxError();
  }

  response.body = await createNew(
    value.name,
    value.path.toUpperCase(),
    value.size,
    value.extensions,
  );
};

export const updateFormat = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  const format = await findById(id);
  if (!format) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;

  if (
    !request_validator.validate("put", value)
  ) {
    throw new RequestSyntaxError();
  }

  response.body = await format.update(
    value.name,
    value.size,
    value.extensions,
  );
};

export const deleteFormat = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const format = await findById(id);
  if (!format) throw new NotFoundError();

  await format.delete();

  response.body = Message.OK;
};
