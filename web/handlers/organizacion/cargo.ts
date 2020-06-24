import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/ORGANIZACION/cargo.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {tableRequestHandler} from "../../../api/common/table.ts";

export const getPositions = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getPositionsTable = async (context: RouterContext) => tableRequestHandler(
  context,
  getTableData,
);

export const createPosition = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    description,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (!(name && description)) {
    throw new RequestSyntaxError();
  }

  const position = await createNew(
    name,
    description,
  );

  response.body = position;
};

export const getPosition = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const position = await findById(id);
  if (!position) throw new NotFoundError();

  response.body = position;
};

export const updatePosition = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let position = await findById(id);
  if (!position) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    name,
    description,
  }: {
    name?: string;
    description?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  position = await position.update(
    name,
    description,
  );

  response.body = position;
};

export const deletePosition = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let position = await findById(id);
  if (!position) throw new NotFoundError();

  await position.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
