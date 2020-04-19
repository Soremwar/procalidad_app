import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/OPERACIONES/PRESUPUESTO.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getBudgets = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getBudgetTable = async ({ request, response }: RouterContext) => {
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

export const createBudget = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    project,
    budget_type,
    name,
    description,
    status,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (
    !(
      Number(project) &&
      Number(budget_type) &&
      name &&
      description &&
      !isNaN(Number(status))
    )
  ) {
    throw new RequestSyntaxError();
  }

  await createNew(
    Number(project),
    Number(budget_type),
    name,
    description,
    Boolean(Number(status)),
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getBudget = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const budget = await findById(id);
  if (!budget) throw new NotFoundError();

  response.body = budget;
};

export const updateBudget = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let budget = await findById(id);
  if (!budget) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    project,
    budget_type,
    name,
    description,
    status,
  }: {
    project?: string;
    budget_type?: string;
    name?: string;
    description?: string;
    status?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  budget = await budget.update(
    Number(project) || undefined,
    Number(budget_type) || undefined,
    name,
    description,
    !isNaN(Number(status)) ? Boolean(Number(status)) : undefined,
  );

  response.body = budget;
};

export const deleteBudget = async ({ params, response }: RouterContext) => {
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
