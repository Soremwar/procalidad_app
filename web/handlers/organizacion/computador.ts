import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/computador.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getComputers = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getComputersTable = async ({ request, response }:
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

export const createComputer = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    description,
    cost,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (!(name && description && !isNaN(Number(cost)))) {
    throw new RequestSyntaxError();
  }

  const computer = await createNew(
    name,
    description,
    Number(cost),
  );

  response.body = computer;
};

export const getComputer = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const computer = await findById(id);
  if (!computer) throw new NotFoundError();

  response.body = computer;
};

export const updateComputer = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let computer = await findById(id);
  if (!computer) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    name,
    description,
    cost,
  }: {
    name?: string;
    description?: string;
    cost?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  computer = await computer.update(
    name,
    description,
    !(isNaN(Number(cost)) || cost) ? undefined : Number(cost),
  );

  response.body = computer;
};

export const deleteComputer = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let computer = await findById(id);
  if (!computer) throw new NotFoundError();

  await computer.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
