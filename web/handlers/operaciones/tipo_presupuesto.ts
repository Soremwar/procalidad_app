import type { RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/OPERACIONES/TIPO_PRESUPUESTO.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

export const getBudgetTypes = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getBudgetTypesTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createBudgetType = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    description,
  } = await request.body({ type: "json" }).value;

  if (!name) throw new RequestSyntaxError();

  await createNew(
    name,
    description,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getBudgetType = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const budget = await findById(id);
  if (!budget) throw new NotFoundError();

  response.body = budget;
};

export const updateBudgetType = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let budget = await findById(id);
  if (!budget) throw new NotFoundError();

  const {
    name,
    description,
  } = await request.body({ type: "json" }).value;

  budget = await budget.update(
    name,
    description,
  );

  response.body = budget;
};

export const deleteBudgetType = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let budget = await findById(id);
  if (!budget) throw new NotFoundError();

  await budget.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
