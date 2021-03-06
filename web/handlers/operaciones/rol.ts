import { helpers, RouterContext } from "oak";
import Ajv from "ajv";
import {
  createNew,
  findAll,
  findById,
  findByProject,
  getTableData,
} from "../../../api/models/OPERACIONES/ROL.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { INTEGER } from "../../../lib/ajv/types.js";

const list_request = {
  $id: "list",
  properties: {
    "project": INTEGER({ min: 1 }),
  },
};

const request_validator = new Ajv({
  schemas: [
    list_request,
  ],
});

export const getRoles = async (context: RouterContext) => {
  const value = helpers.getQuery(context);

  if (!request_validator.validate("list", value)) {
    throw new RequestSyntaxError();
  }

  context.response.body = await findAll({
    project: Number(value.proyecto),
  });
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
  } = await request.body({ type: "json" }).value;

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

  const {
    name,
    description,
  } = await request.body({ type: "json" }).value;

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
