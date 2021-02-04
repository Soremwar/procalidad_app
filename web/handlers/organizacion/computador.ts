import Ajv from "ajv";
import {
  create,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/computer.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { Message } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { RouterContext } from "../../state.ts";
import {
  INTEGER,
  STANDARD_DATE_STRING,
  STRING,
} from "../../../lib/ajv/types.js";
import { Computer, ComputerData } from "../../../api/models/interfaces.ts";

const costs = {
  properties: {
    "cost": INTEGER({ min: 1 }),
    "end_date": STANDARD_DATE_STRING,
    "id": INTEGER({ min: 1 }),
    "start_date": STANDARD_DATE_STRING,
  },
  required: [
    "cost",
    "end_date",
    "start_date",
  ],
};

const update_request = {
  $id: "update",
  properties: {
    "costs": {
      type: "array",
      items: costs,
    },
    "description": STRING(255),
    "name": STRING(100),
  },
  required: [
    "costs",
  ],
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "costs",
    "description",
    "name",
  ],
});

const request_validator = new Ajv({
  coerceTypes: true,
  schemas: [
    create_request,
    update_request,
  ],
});

export const getComputersTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createComputer = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value: ComputerData = await request.body({ type: "json" }).value;
  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  const computer = await create(value);

  response.body = computer;
};

export const getComputer = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const computer = await findById(id);
  if (!computer) throw new NotFoundError();

  response.body = computer;
};

export const updateComputer = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  const computer = await findById(id);
  if (!computer) throw new NotFoundError();

  const value: ComputerData = await request.body({ type: "json" }).value;
  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  await computer.update(value);

  response.body = computer;
};

export const deleteComputer = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const computer = await findById(id);
  if (!computer) throw new NotFoundError();

  await computer.delete();

  response.body = Message.OK;
};
