import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/OPERACIONES/ROL.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {tableRequestHandler} from "../../../api/common/table.ts";

export const getRoles = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getRolesTable = async (context: RouterContext) => tableRequestHandler(
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

  await createNew(
    name,
    description,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getRole = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const role = await findById(id);
  if (!role) throw new NotFoundError();

  response.body = role;
};

export const updateRole = async (
  { params, request, response }: RouterContext,
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

  role = await role.update(
    name,
    description,
  );

  response.body = role;
};

export const deleteRole = async ({ params, response }: RouterContext) => {
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
