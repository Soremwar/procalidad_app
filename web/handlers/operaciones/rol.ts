import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  findByProject,
  getTableData,
} from "../../../api/models/OPERACIONES/ROL.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { searchByName } from "../../../api/models/MAESTRO/PAIS.ts";

export const getRoles = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getRolesTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createRole = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    description,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (!name) throw new RequestSyntaxError();

  response.body = await createNew(
    name,
    description,
  );
};

export const getRole = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const role = await findById(id);
  if (!role) throw new NotFoundError();

  response.body = role;
};

export const updateRole = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let role = await findById(id);
  if (!role) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    name,
    description,
  }: {
    name?: string;
    description?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  response.body = await role.update(
    name,
    description,
  );
};

export const deleteRole = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let role = await findById(id);
  if (!role) throw new NotFoundError();

  await role.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const searchRoles = async ({ request, response }: RouterContext) => {
  const {
    proyecto,
  }: { [x: string]: string } = Object.fromEntries(
    request.url.searchParams.entries(),
  );

  if (!Number(proyecto)) throw new RequestSyntaxError();

  response.body = await findByProject(Number(proyecto));
};
