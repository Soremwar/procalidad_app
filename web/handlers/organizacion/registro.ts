import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/registro_detalle.ts";
import Ajv from "ajv";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {
  TRUTHY_INTEGER,
  UNSIGNED_NUMBER,
} from "../../../lib/ajv/types.js";

const post_structure = {
  $id: "post",
  properties: {
    "week": TRUTHY_INTEGER,
    "budget": TRUTHY_INTEGER,
    "hours": UNSIGNED_NUMBER,
  },
  required: [
    "week",
    "budget",
    "hours",
  ],
};

const put_structure = {
  $id: "put",
  properties: {
    "hours": UNSIGNED_NUMBER,
  },
  required: [
    "hours",
  ],
};

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    post_structure,
    put_structure,
  ],
});

export const getWeeksDetail = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getWeekDetail = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const detail = await findById(id);
  if (!detail) throw new NotFoundError();

  response.body = detail;
};

export const getWeekDetailTable = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  response.body = await getTableData(id);
};

export const createWeekDetail = async (
  { request, response }: RouterContext,
) => {
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

  response.body = await createNew(
    Number(value.week),
    Number(value.budget),
    Number(value.hours),
  );
};

export const updateWeekDetail = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  const {
    type,
    value,
  }: Body = await request.body();

  if (
    type !== "json" || !request_validator.validate("put", value)
  ) {
    throw new RequestSyntaxError();
  }

  let detail = await findById(id);
  if (!detail) throw new NotFoundError();

  response.body = await detail.update(
    Number(value.hours),
  );
};
