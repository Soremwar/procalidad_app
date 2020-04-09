import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData
} from "../../../api/models/ORGANIZACION/AREA.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getAreas = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getAreasTable = async ({ request, response }: RouterContext) => {
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

export const createArea = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    area_type,
    name,
    supervisor,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (!(Number(area_type) && name && Number(supervisor))) {
    throw new RequestSyntaxError();
  }

  await createNew(
    Number(area_type),
    name,
    Number(supervisor),
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getArea = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const area = await findById(id);
  if (!area) throw new NotFoundError();

  response.body = area;
};

export const updateArea = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let area = await findById(id);
  if (!area) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    area_type,
    name,
    supervisor,
  }: {
    area_type?: string;
    name?: string;
    supervisor?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  area = await area.update(
    Number(area_type) || undefined,
    name,
    Number(supervisor) || undefined,
  );

  response.body = area;
};

export const deleteArea = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let area = await findById(id);
  if (!area) throw new NotFoundError();

  await area.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
