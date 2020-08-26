import Ajv from "ajv";
import { RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/area_type.ts";
import { Message } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { BOOLEAN, TRUTHY_INTEGER } from "../../../lib/ajv/types.js";

const update_request = {
  $id: "update",
  properties: {
    "name": {
      maxLength: 100,
      type: "string",
    },
    "supervisor": TRUTHY_INTEGER,
    "time_records": BOOLEAN,
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "name",
    "supervisor",
    "time_records",
  ],
});

//@ts-ignore
const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const getAreaTypes = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getAreaTypesTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createAreaType = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;

  if (
    !request_validator.validate("create", value)
  ) {
    throw new RequestSyntaxError();
  }

  await createNew(
    value.name,
    value.supervisor,
    value.time_records,
  );

  response.body = Message.OK;
};

export const getAreaType = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const area_type = await findById(id);
  if (!area_type) throw new NotFoundError();

  response.body = area_type;
};

export const updateAreaType = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let area_type = await findById(id);
  if (!area_type) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;

  if (
    !request_validator.validate("update", value)
  ) {
    throw new RequestSyntaxError();
  }

  response.body = await area_type.update(
    value.name,
    value.supervisor,
    value.time_records,
  );
};

export const deleteAreaType = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let area_type = await findById(id);
  if (!area_type) throw new NotFoundError();

  await area_type.delete();

  response.body = Message.OK;
};
