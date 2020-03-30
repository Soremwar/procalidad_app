import { RouterContext, Body } from "oak";
import {
  findAll,
  findById,
  createNew
} from "../../../api/models/CLIENTES/CLIENTE.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getClients = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const createClient = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    sector,
    name,
    nit,
    verification_digit,
    business,
    city,
    address,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (
    !(Number(sector) && name && nit && Number(verification_digit) && business &&
      city && address)
  ) {
    throw new RequestSyntaxError();
  }

  await createNew(
    Number(sector),
    name,
    nit,
    Number(verification_digit),
    business,
    city,
    address,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getClient = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const client = await findById(id);
  if (!client) throw new NotFoundError();

  response.body = client;
};

export const updateClient = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let client = await findById(id);
  if (!client) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    sector,
    name,
    nit,
    verification_digit,
    business,
    city,
    address,
  }: {
    sector?: string;
    name?: string;
    nit?: string;
    verification_digit?: string;
    business?: string;
    city?: string;
    address?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  client = await client.update(
    Number(sector) || undefined,
    name,
    nit,
    Number(verification_digit) || undefined,
    business,
    city,
    address,
  );

  response.body = client;
};

export const deleteClient = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let client = await findById(id);
  if (!client) throw new NotFoundError();

  await client.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
