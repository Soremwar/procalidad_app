import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/licencia.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

export const getLicences = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getLicencesTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createLicence = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    description,
    cost,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (!(name && description && !isNaN(Number(cost)))) {
    throw new RequestSyntaxError();
  }

  const licencia = await createNew(
    name,
    description,
    Number(cost),
  );

  response.body = licencia;
};

export const getLicence = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const licencia = await findById(id);
  if (!licencia) throw new NotFoundError();

  response.body = licencia;
};

export const updateLicence = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let licencia = await findById(id);
  if (!licencia) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    name,
    description,
    cost,
  }: {
    name?: string;
    description?: string;
    cost?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  licencia = await licencia.update(
    name,
    description,
    !(isNaN(Number(cost)) || cost) ? undefined : Number(cost),
  );

  response.body = licencia;
};

export const deleteLicence = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let licencia = await findById(id);
  if (!licencia) throw new NotFoundError();

  await licencia.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
