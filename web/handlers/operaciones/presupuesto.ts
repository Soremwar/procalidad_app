import { RouterContext, Body } from "oak";
import {
  createNew as createBudgetItem,
  findAll as findBudgetItems,
  findById as findBudgetItem,
  getTableData as getBudgetItemTable,
} from "../../../api/models/OPERACIONES/PRESUPUESTO.ts";
import {
  createNew as createBudgetDetail,
  deleteByBudget as deleteBudgetDetail,
  findByBudget as findBudgetDetail,
} from "../../../api/models/OPERACIONES/PRESUPUESTO_DETALLE.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getBudgets = async ({ response }: RouterContext) => {
  response.body = await findBudgetItems();
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

  const data = await getBudgetItemTable(
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
    roles,
  } = await request.body().then((x: Body) => x.value);

  if (
    !(
      Number(project) &&
      Number(budget_type) &&
      name &&
      description &&
      !isNaN(Number(status)) &&
      Array.isArray(roles)
    )
  ) {
    throw new RequestSyntaxError();
  }

  const budget_id = await createBudgetItem(
    Number(project),
    Number(budget_type),
    name,
    description,
    Boolean(Number(status)),
  );

  for (const role of roles) {
    if (!Number(role.id)) continue;
    await createBudgetDetail(
      budget_id,
      Number(role.id),
      Number(role.time) || 0,
      Number(role.price) || 0,
    );
  }

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getBudget = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const budget = await findBudgetItem(id);
  if (!budget) throw new NotFoundError();

  const detail = await findBudgetDetail(id);

  response.body = { ...budget, roles: detail };
};

export const updateBudget = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let budget = await findBudgetItem(id);
  if (!budget) throw new NotFoundError();

  const {
    project,
    budget_type,
    name,
    description,
    status,
    roles,
  } = await request.body().then((x: Body) => x.value);

  budget = await budget.update(
    Number(project) || undefined,
    Number(budget_type) || undefined,
    name,
    description,
    !isNaN(Number(status)) ? Boolean(Number(status)) : undefined,
  );

  await deleteBudgetDetail(id);
  for (const role of roles) {
    if (!Number(role.id)) continue;
    await createBudgetDetail(
      id,
      Number(role.id),
      Number(role.time) || 0,
      Number(role.price) || 0,
    );
  }

  response.body = budget;
};

export const deleteBudget = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let budget = await findBudgetItem(id);
  if (!budget) throw new NotFoundError();

  await deleteBudgetDetail(id);

  await budget.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
