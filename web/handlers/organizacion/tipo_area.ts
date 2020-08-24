import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/area_type.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import {
  castStringToBoolean,
} from "../../../lib/utils/boolean.js";

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
    time_records,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (
    !(
      name &&
      Number(supervisor)
    )
  ) {
    throw new RequestSyntaxError();
  }

  let parsed_time_records: boolean;

  try {
    parsed_time_records = castStringToBoolean(time_records);
  } catch (e) {
    throw new RequestSyntaxError();
  }

  await createNew(
    name,
    Number(supervisor),
    parsed_time_records,
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
    time_records,
  }: {
    name?: string;
    supervisor?: string;
    time_records?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  let parsed_time_records: boolean;

  try {
    parsed_time_records = castStringToBoolean(time_records);
  } catch (e) {
    throw new RequestSyntaxError();
  }

  response.body = await area_type.update(
    name,
    Number(supervisor) || undefined,
    parsed_time_records,
  );
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
