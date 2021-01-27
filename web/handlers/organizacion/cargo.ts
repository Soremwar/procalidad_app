import Ajv from "ajv";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/cargo.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { RouterContext } from "../../state.ts";
import { STRING } from "../../../lib/ajv/types.js";

const update_request = {
  $id: "update",
  properties: {
    "name": STRING(100),
    "description": STRING(255),
    "public_name": STRING(100),
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "name",
    "description",
    "public_name",
  ],
});

const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const getPositions = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getPositionsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createPosition = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value: {
    name: string;
    description: string;
    public_name: string;
  } = await request.body({ type: "json" }).value;
  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await createNew(
    value.name,
    value.description,
    value.public_name,
  );
};

export const getPosition = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const position = await findById(id);
  if (!position) throw new NotFoundError();

  response.body = position;
};

export const updatePosition = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let position = await findById(id);
  if (!position) throw new NotFoundError();

  const value: {
    name: string;
    description: string;
    public_name: string;
  } = await request.body({ type: "json" }).value;
  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  await position.update(
    value.name,
    value.description,
    value.public_name,
  );

  response.body = position;
};

export const deletePosition = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let position = await findById(id);
  if (!position) throw new NotFoundError();

  await position.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
