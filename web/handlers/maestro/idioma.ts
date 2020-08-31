import { RouterContext } from "oak";
import Ajv from "ajv";
import {
  create,
  findById,
  getAll,
  getTableData,
} from "../../../api/models/MAESTRO/language.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { Message } from "../../http_utils.ts";

const update_request = {
  $id: "update",
  properties: {
    "name": {
      maxLength: 50,
      type: "string",
    },
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "name",
  ],
});

//@ts-ignore
const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const getLanguages = async ({ response }: RouterContext) => {
  response.body = await getAll();
};

export const getLanguagesTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createLanguage = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await create(
    value.name,
  );
};

export const getLanguage = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const language = await findById(id);
  if (!language) throw new NotFoundError();

  response.body = language;
};

export const updateLanguage = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let language = await findById(id);
  if (!language) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await language.update(
    value.name,
  );
};

export const deleteLanguage = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let language = await findById(id);
  if (!language) throw new NotFoundError();

  await language.delete();

  response.body = Message.OK;
};
