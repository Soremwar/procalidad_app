import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData
} from "../../../api/models/OPERACIONES/TIPO_PROYECTO.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getProjectTypes = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getProjectTypesTable = async (
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

export const createProjectType = async (
  { request, response }: RouterContext,
) => {
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

export const getProjectType = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const project_type = await findById(id);
  if (!project_type) throw new NotFoundError();

  response.body = project_type;
};

export const updateProjectType = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let project_type = await findById(id);
  if (!project_type) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    name,
  }: {
    name?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  project_type = await project_type.update(
    name,
  );

  response.body = project_type;
};

export const deleteProjectType = async (
  { params, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let project_type = await findById(id);
  if (!project_type) throw new NotFoundError();

  await project_type.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
