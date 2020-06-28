import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  searchByNameAndClient,
} from "../../../api/models/OPERACIONES/PROYECTO.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getProjects = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getProjectsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

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

  if (
    !(
      Number(type) &&
      Number(client) &&
      Number(area) &&
      name &&
      description &&
      Number.isInteger(Number(status))
    )
  ) {
    throw new RequestSyntaxError();
  }

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

export const searchProject = async ({ response, request }: RouterContext) => {
  const {
    client: param_client,
    query: param_query,
    limit: param_limit,
  }: { [x: string]: string } = Object.fromEntries(
    request.url.searchParams.entries(),
  );

  const client: number = Number(param_client);
  const query: string = param_query;
  const limit: number = Number(param_limit) || 0;

  if (!client) throw new RequestSyntaxError();
  response.body = await searchByNameAndClient(client, query, limit);
};

export const updateProject = async (
  { params, request, response }: RouterContext,
) => {
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
