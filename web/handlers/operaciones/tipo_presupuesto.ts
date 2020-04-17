import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/OPERACIONES/TIPO_PRESUPUESTO.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getBudgetTypes = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getBudgetTypesTable = async ({ request, response }:
  RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    order = {},
    page,
    rows,
    search,
  } = await request.body().then((x: Body) => x.value);

  if (!(order instanceof Object)) throw new RequestSyntaxError();

  const order_parameters = Object.entries(order).reduce(
    (res: TableOrder, [index, value]: [string, any]) => {
      if (value in Order) {
        res[index] = value as Order;
      }
      return res;
    },
    {} as TableOrder,
  );

  const search_query = ["string", "number"].includes(typeof search)
    ? String(search)
    : "";

  const data = await getTableData(
    order_parameters,
    page || 0,
    rows || null,
    search_query,
  );

  response.body = data;
};

export const createBudgetType = async ({ request, response }:
  RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    description,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

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

export const getBudgetType = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const budget = await findById(id);
  if (!budget) throw new NotFoundError();

  response.body = budget;
};

export const updateBudgetType = async ({ params, request, response }:
  RouterContext) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let budget = await findById(id);
  if (!budget) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    name,
    description,
  }: {
    name?: string;
    description?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  budget = await budget.update(
    name,
    description,
  );

  response.body = budget;
};

export const deleteBudgetType = async ({ params, response }: RouterContext) => {
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
