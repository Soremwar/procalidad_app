import {
  Body,
  RouterContext,
} from "oak";
import Ajv from "ajv";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  hasAccessDefined,
} from "../../../api/models/MAESTRO/access.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import {
  TRUTHY_NUMERIC_VALUE,
} from "../../../lib/ajv/types.js";

const post_request = {
  $id: "post",
  required: [
    "person",
    "profiles",
  ],
  properties: {
    "person": TRUTHY_NUMERIC_VALUE,
    "profiles": {
      items: TRUTHY_NUMERIC_VALUE,
      type: "array",
    },
  },
};

const put_request = {
  $id: "put",
  properties: {
    "person": TRUTHY_NUMERIC_VALUE,
    "profiles": {
      items: TRUTHY_NUMERIC_VALUE,
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

  const {
    type,
    value,
  }: Body = await request.body();

  if (
    type !== "json" || !request_validator.validate("post", value)
  ) {
    throw new RequestSyntaxError();
  }

  if (await hasAccessDefined(value.person)) {
    throw new Error("Esta persona ya tiene un acceso definido");
  }

  const licencia = await createNew(
    value.person,
    value.profiles,
  );

  response.body = licencia;
};

export const getAccess = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const licencia = await findById(id);
  if (!licencia) throw new NotFoundError();

  response.body = licencia;
};

export const updateAccess = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let licencia = await findById(id);
  if (!licencia) throw new NotFoundError();

  const {
    type,
    value,
  }: Body = await request.body();

  if (
    type !== "json" || !request_validator.validate("put", value)
  ) {
    throw new RequestSyntaxError();
  }

  licencia = await licencia.update(
    value.person,
    value.profiles,
  );

  response.body = licencia;
};

export const deleteAccess = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let licencia = await findById(id);
  if (!licencia) throw new NotFoundError();

  await licencia.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
