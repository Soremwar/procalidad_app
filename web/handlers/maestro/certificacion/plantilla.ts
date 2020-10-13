import type { RouterContext } from "oak";
import Ajv from "ajv";
import {
  Certification,
  create,
  findById,
  getAll,
  getTableData,
} from "../../../../api/models/users/certification_template.ts";
import { tableRequestHandler } from "../../../../api/common/table.ts";
import { NotFoundError, RequestSyntaxError } from "../../../exceptions.ts";
import { Message } from "../../../http_utils.ts";
import { STRING, TRUTHY_INTEGER } from "../../../../lib/ajv/types.js";

const update_request = {
  $id: "update",
  properties: {
    "name": STRING(50),
    "provider": TRUTHY_INTEGER,
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "name",
    "provider",
  ],
});

const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const createTemplate = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  const name = (value.name as string).trim().toUpperCase();

  if (await Certification.nameIsTaken(name)) {
    throw new RequestSyntaxError("El nombre ya se encuentra tomado");
  }

  response.body = await create(
    value.provider,
    name,
  );
};

export const deleteTemplate = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let template = await findById(id);
  if (!template) throw new NotFoundError();

  await template.delete();

  response.body = Message.OK;
};

export const getTemplate = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const template = await findById(id);
  if (!template) throw new NotFoundError();

  response.body = template;
};

export const getTemplates = async ({ response }: RouterContext) => {
  response.body = await getAll();
};

export const getProvidersTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const updateTemplates = async (
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

  const name = (value.name as string).trim().toUpperCase();

  if (await Certification.nameIsTaken(name, template.id)) {
    throw new RequestSyntaxError("El nombre ya se encuentra tomado");
  }

  response.body = await template.update(
    value.provider,
    name,
  );
};
