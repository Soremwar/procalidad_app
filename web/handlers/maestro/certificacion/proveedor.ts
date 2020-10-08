import type { RouterContext } from "oak";
import Ajv from "ajv";
import {
  CertificationProvider,
  create,
  findById,
  getAll,
  getTableData,
} from "../../../../api/models/users/certification_provider.ts";
import { tableRequestHandler } from "../../../../api/common/table.ts";
import { NotFoundError, RequestSyntaxError } from "../../../exceptions.ts";
import { Message } from "../../../http_utils.ts";

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

const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const createProvider = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  const name = (value.name as string).trim().toUpperCase();

  if (await CertificationProvider.nameIsTaken(name)) {
    throw new RequestSyntaxError("El nombre ya se encuentra tomado");
  }

  response.body = await create(
    value.name,
  );
};

export const deleteProvider = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let provider = await findById(id);
  if (!provider) throw new NotFoundError();

  await provider.delete();

  response.body = Message.OK;
};

export const getProvider = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const provider = await findById(id);
  if (!provider) throw new NotFoundError();

  response.body = provider;
};

export const getProviders = async ({ response }: RouterContext) => {
  response.body = await getAll();
};

export const getProvidersTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const updateProviders = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let provider = await findById(id);
  if (!provider) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  const name = (value.name as string).trim().toUpperCase();

  if (await CertificationProvider.nameIsTaken(name, provider.id)) {
    throw new RequestSyntaxError("El nombre ya se encuentra tomado");
  }

  response.body = await provider.update(
    name,
  );
};
