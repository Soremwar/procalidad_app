import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  TipoParametro,
} from "../../../api/models/MAESTRO/parametro.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getParameters = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getParametersTable = async ({ request, response }:
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

export const createParameter = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    description,
    type,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (
    !(
      name &&
      description &&
      type
    )
  ) {
    throw new RequestSyntaxError();
  }

  await createNew(
    name,
    description,
    type in TipoParametro ? type as TipoParametro : TipoParametro.string,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getParameter = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const parameter = await findById(id);
  if (!parameter) throw new NotFoundError();

  response.body = parameter;
};

export const updateParameter = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let parameter = await findById(id);
  if (!parameter) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    name,
    description,
    type,
  }: {
    name?: string;
    description?: string;
    type?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  parameter = await parameter.update(
    id,
    name,
    description,
    type in TipoParametro ? type as TipoParametro : TipoParametro.string,
  );

  response.body = parameter;
};

export const deleteParameter = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let parameter = await findById(id);
  if (!parameter) throw new NotFoundError();

  await parameter.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
