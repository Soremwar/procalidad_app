import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/TIPO_AREA.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

export const getAreaTypes = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getAreaTypesTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createAreaType = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    supervisor,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (!(name && Number(supervisor))) throw new RequestSyntaxError();

  await createNew(
    name,
    Number(supervisor),
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getAreaType = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const area_type = await findById(id);
  if (!area_type) throw new NotFoundError();

  response.body = area_type;
};

export const updateAreaType = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let area_type = await findById(id);
  if (!area_type) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    name,
    supervisor,
  }: {
    name?: string;
    supervisor?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  area_type = await area_type.update(
    name,
    Number(supervisor) || undefined,
  );

  response.body = area_type;
};

export const deleteAreaType = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let area_type = await findById(id);
  if (!area_type) throw new NotFoundError();

  await area_type.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
