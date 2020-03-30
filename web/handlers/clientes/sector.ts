import { RouterContext, Body } from "oak";
import {
  findAll,
  findById,
  createNew
} from "../../../api/models/CLIENTES/SECTOR.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getSectors = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const createSector = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (!name) throw new RequestSyntaxError();

  await createNew(
    name,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getSector = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const sector = await findById(id);
  if (!sector) throw new NotFoundError();

  response.body = sector;
};

export const updateSector = async ({ params, request, response }:
  RouterContext) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let sector = await findById(id);
  if (!sector) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    name,
  }: {
    name?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  sector = await sector.update(
    name,
  );

  response.body = sector;
};

export const deleteSector = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let contact = await findById(id);
  if (!contact) throw new NotFoundError();

  await contact.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
