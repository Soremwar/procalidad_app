import { Body, RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/asignacion/asignacion.ts";
import {
  tableRequestHandler,
} from "../../../api/common/table.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { parseStandardNumber } from "../../../lib/date/mod.js";

export const getAssignations = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getAssignationsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createAssignation = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    person,
    budget,
    role,
    date,
    hours,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (
    !(
      Number(person) &&
      Number(budget) &&
      Number(role) &&
      parseStandardNumber(date) &&
      Number(hours)
    )
  ) {
    throw new RequestSyntaxError();
  }

  response.body = await createNew(
    Number(person),
    Number(budget),
    Number(role),
    Number(date),
    Number(hours),
  );
};

export const getAssignation = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const resource = await findById(id);
  if (!resource) throw new NotFoundError();

  response.body = resource;
};

export const updateAssignation = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let resource = await findById(id);
  if (!resource) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    person,
    budget,
    role,
    date,
    hours,
  }: {
    person?: string;
    budget?: string;
    role?: string;
    date?: string;
    hours?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  response.body = await resource.update(
    Number(person) || undefined,
    Number(budget) || undefined,
    Number(role) || undefined,
    parseStandardNumber(date) ? Number(date) : undefined,
    Number(hours) || undefined,
  );
};

export const deleteAssignation = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let resource = await findById(id);
  if (!resource) throw new NotFoundError();

  await resource.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
