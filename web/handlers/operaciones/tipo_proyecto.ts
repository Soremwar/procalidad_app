import type { RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/OPERACIONES/TIPO_PROYECTO.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

export const getProjectTypes = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getProjectTypesTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createProjectType = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    billable,
  } = await request.body({ type: "json" }).value;

  if (!(name && !isNaN(Number(billable)))) throw new RequestSyntaxError();

  await createNew(
    name,
    Boolean(Number(billable)),
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getProjectType = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const project_type = await findById(id);
  if (!project_type) throw new NotFoundError();

  response.body = project_type;
};

export const updateProjectType = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let project_type = await findById(id);
  if (!project_type) throw new NotFoundError();

  const {
    name,
    billable,
  } = await request.body({ type: "json" }).value;

  project_type = await project_type.update(
    name,
    !isNaN(Number(billable)) ? Boolean(Number(billable)) : undefined,
  );

  response.body = project_type;
};

export const deleteProjectType = async (
  { params, response }: RouterContext<{ id: string }>,
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
