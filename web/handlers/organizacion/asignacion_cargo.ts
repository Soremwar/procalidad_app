import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  isPersonAssigned,
} from "../../../api/models/ORGANIZACION/asignacion_cargo.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getAssignations = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getAssignationsTable = async (
  { request, response }: RouterContext,
) => {
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

export const createAssignation = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    person,
    sub_area,
    position,
    roles,
  }: {
    person: string,
    sub_area: string,
    position: string,
    roles: string[],
  } = await request.body().then((x: Body) => x.value);

  if (!(
    Number(person) &&
    Number(sub_area) &&
    Number(position) &&
    Array.isArray(roles)
  )) throw new RequestSyntaxError();

  if(await isPersonAssigned(Number(person))) throw new Error("La persona ya tiene una asignacion de cargo vigente");

  response.body = await createNew(
    Number(person),
    Number(sub_area),
    Number(position),
    roles.map(Number).filter(Boolean),
  );
};

export const getAssignation = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const assignation = await findById(id);
  if (!assignation) throw new NotFoundError();

  response.body = assignation;
};

export const updateAssignation = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let assignation = await findById(id);
  if (!assignation) throw new NotFoundError();

  const {
    sub_area,
    position,
    roles,
  } = await request.body().then((x: Body) => x.value);

  assignation = await assignation.update(
    Number(sub_area) ? Number(sub_area) : undefined,
    Number(position) ? Number(position) : undefined,
    Array.isArray(roles) ? roles.map(Number).filter(Boolean) : undefined,
  );

  response.body = assignation;
};

export const deleteAssignation = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let assignation = await findById(id);
  if (!assignation) throw new NotFoundError();

  await assignation.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
