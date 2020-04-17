import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/OPERACIONES/PROYECTO.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getProjects = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getProjectsTable = async (
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

export const createProject = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    type,
    client,
    area,
    name,
    description,
    status,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (!(Number(type) && Number(client) && Number(area) && name && description && Number.isInteger(Number(status)))) throw new RequestSyntaxError();

  await createNew(
    Number(type),
    Number(client),
    Number(area),
    name,
    description,
    Number(status),
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getProject = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const project = await findById(id);
  if (!project) throw new NotFoundError();

  response.body = project;
};

export const updateProject = async ({ params, request, response }:
  RouterContext) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let project = await findById(id);
  if (!project) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    type,
    client,
    area,
    name,
    description,
    status,
  }: {
    type?: string;
    client?: string;
    area?: string;
    name?: string;
    description?: string;
    status?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  project = await project.update(
    Number(type) || undefined,
    Number(client) || undefined,
    Number(area) || undefined,
    name,
    description,
    Number.isInteger(Number(status)) ? Number(status) : undefined,
  );

  response.body = project;
};

export const deleteProject = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let project = await findById(id);
  if (!project) throw new NotFoundError();

  await project.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
