import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/sub_area.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getSubAreas = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getSubAreasTable = async ({ request, response }:
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

export const createSubArea = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    area,
    name,
    supervisor,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (!(Number(area) && name && Number(supervisor))) {
    throw new RequestSyntaxError();
  }

  await createNew(
    Number(area),
    name,
    Number(supervisor),
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getSubArea = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const sub_area = await findById(id);
  if (!sub_area) throw new NotFoundError();

  response.body = sub_area;
};

export const updateSubArea = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let sub_area = await findById(id);
  if (!sub_area) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    area,
    name,
    supervisor,
  }: {
    area?: string;
    name?: string;
    supervisor?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  sub_area = await sub_area.update(
    Number(area) || undefined,
    name,
    Number(supervisor) || undefined,
  );

  response.body = sub_area;
};

export const deleteSubArea = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let sub_area = await findById(id);
  if (!sub_area) throw new NotFoundError();

  await sub_area.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
