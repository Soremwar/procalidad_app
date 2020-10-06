import type { RouterContext } from "oak";
import Ajv from "ajv";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  hasAccessDefined,
} from "../../../api/models/MAESTRO/access.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { TRUTHY_INTEGER } from "../../../lib/ajv/types.js";

const post_request = {
  $id: "post",
  required: [
    "person",
    "profiles",
  ],
  properties: {
    "person": TRUTHY_INTEGER,
    "profiles": {
      items: TRUTHY_INTEGER,
      type: "array",
    },
  },
};

const put_request = {
  $id: "put",
  properties: {
    "person": TRUTHY_INTEGER,
    "profiles": {
      items: TRUTHY_INTEGER,
      type: "array",
    },
  },
};
// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    post_request,
    put_request,
  ],
});

export const getAccesses = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getAccessesTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createAccess = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (
    !request_validator.validate("post", value)
  ) {
    throw new RequestSyntaxError();
  }

  if (await hasAccessDefined(value.person)) {
    throw new Error("Esta persona ya tiene un acceso definido");
  }

  response.body = await createNew(
    value.person,
    value.profiles,
  );
};

export const getAccess = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const acceso = await findById(id);
  if (!acceso) throw new NotFoundError();

  response.body = acceso;
};

export const updateAccess = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let acceso = await findById(id);
  if (!acceso) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;

  if (
    !request_validator.validate("put", value)
  ) {
    throw new RequestSyntaxError();
  }

  response.body = await acceso.update(
    value.person,
    value.profiles,
  );
};

export const deleteAccess = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let acceso = await findById(id);
  if (!acceso) throw new NotFoundError();

  await acceso.delete();

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
