import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  isPersonAssigned,
} from "../../../api/models/ORGANIZACION/asignacion_cargo.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {tableRequestHandler} from "../../../api/common/table.ts";

export const getAssignations = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getAssignationsTable = async (context: RouterContext) => tableRequestHandler(
  context,
  getTableData,
);

export const createAssignation = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    person,
    sub_area,
    position,
    roles,
    validity,
  }: {
    person: string,
    sub_area: string,
    position: string,
    roles: string[],
    validity: string,
  } = await request.body().then((x: Body) => x.value);

  if (!(
    Number(person) &&
    Number(sub_area) &&
    Number(position) &&
    Array.isArray(roles) &&
    !isNaN(new Date(validity).getTime())
  )) throw new RequestSyntaxError();

  if(await isPersonAssigned(Number(person))) throw new Error("La persona ya tiene una asignacion de cargo vigente");

  response.body = await createNew(
    Number(person),
    Number(sub_area),
    Number(position),
    roles.map(Number).filter(Boolean),
    new Date(validity),
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
    validity,
  } = await request.body().then((x: Body) => x.value);

  assignation = await assignation.update(
    Number(sub_area) ? Number(sub_area) : undefined,
    Number(position) ? Number(position) : undefined,
    Array.isArray(roles) ? roles.map(Number).filter(Boolean) : undefined,
    !isNaN(new Date(validity).getTime()) ? new Date(validity) : undefined,
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
