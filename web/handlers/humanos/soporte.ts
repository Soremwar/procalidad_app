import { RouterContext } from "oak";
import Ajv from "ajv";
import {
  create,
  getAll,
  findById,
  generateTable,
} from "../../../api/models/files/template.ts";
import {
  getFileFormatCode,
} from "../../../api/parameters.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { Message } from "../../http_utils.ts";

const update_request = {
  $id: "update",
  properties: {
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
  response.body = await getAll(await getFileFormatCode());
};

export const getSupportFormatsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    generateTable(await getFileFormatCode()),
  );

export const createSupportFormat = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const format = await getFileFormatCode();

  const value = await request.body({ type: "json" }).value;

  response.body = await create(
    format,
    value.name,
    value.prefix.toUpperCase(),
  );
};

export const getSupportFormat = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const format = await getFileFormatCode();

  const template = await findById(id, format);
  if (!template) throw new NotFoundError();

  response.body = template;
};

export const updateSupportFormat = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  const format = await getFileFormatCode();

  let template = await findById(id, format);
  if (!template) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;

  response.body = await template.update(
    value.name,
  );
};

export const deleteSupportFormat = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const format = await getFileFormatCode();

  let template = await findById(id, format);
  if (!template) throw new NotFoundError();

  await template.delete();

  response.body = Message.OK;
};
