import { RouterContext, Body } from "oak";
import {
  findAll,
  findById,
  createNew,
  getTableData
} from "../../../api/models/CLIENTES/SECTOR.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getSectors = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getSectorsTable = async ({ request, response }: RouterContext) => {
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

export const createSector = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (!name) throw new RequestSyntaxError();

  await createNew(
    name,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getSector = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const sector = await findById(id);
  if (!sector) throw new NotFoundError();

  response.body = sector;
};

export const updateSector = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let sector = await findById(id);
  if (!sector) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    name,
  }: {
    name?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  sector = await sector.update(
    name,
  );

  response.body = sector;
};

export const deleteSector = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let contact = await findById(id);
  if (!contact) throw new NotFoundError();

  await contact.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
