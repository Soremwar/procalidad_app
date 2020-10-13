import type { RouterContext } from "oak";
import Ajv from "ajv";
import {
  CertificationType,
  create,
  findById,
  getAll,
  getTableData,
} from "../../../../api/models/users/certification_type.ts";
import { tableRequestHandler } from "../../../../api/common/table.ts";
import { NotFoundError, RequestSyntaxError } from "../../../exceptions.ts";
import { Message } from "../../../http_utils.ts";

const update_request = {
  $id: "update",
  properties: {
    "name": {
      minLength: 3,
      maxLength: 50,
      type: "string",
    },
    "description": {
      maxLength: 255,
      type: "string",
    },
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "name",
    "description",
  ],
});

const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const createType = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  if (await CertificationType.nameIsTaken(value.name)) {
    throw new RequestSyntaxError(
      "El nombre ya se encuentra tomado\nEl nombre no puede iniciar con los mismos tres carácteres a otro",
    );
  }

  response.body = await create(
    value.name,
    value.description,
  );
};

export const deleteType = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let language = await findById(id);
  if (!language) throw new NotFoundError();

  await language.delete();

  response.body = Message.OK;
};

export const getType = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const language = await findById(id);
  if (!language) throw new NotFoundError();

  response.body = language;
};

export const getTypes = async ({ response }: RouterContext) => {
  response.body = await getAll();
};

export const getTypesTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const updateTypes = async (
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

  if (await CertificationType.nameIsTaken(value.name, language.id)) {
    throw new RequestSyntaxError(
      "El nombre ya se encuentra tomado. El nombre no puede iniciar con los mismos tres carácteres a otro",
    );
  }

  response.body = await language.update(
    value.name,
    value.description,
  );
};
