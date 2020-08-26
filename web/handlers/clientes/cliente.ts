import { RouterContext, Body } from "oak";
import {
  createNew,
  getTableData,
  findAll,
  findById,
} from "../../../api/models/CLIENTES/CLIENTE.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

export const getClients = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getClientsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

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
  } = await request.body({ type: "json" }).value;

  if (
    !(Number(sector) && name && nit && Number(verification_digit) && business &&
      Number(city) && address)
  ) {
    throw new RequestSyntaxError();
  }

  await createNew(
    Number(sector),
    name,
    nit,
    Number(verification_digit),
    business,
    Number(city),
    address,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getClient = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const client = await findById(id);
  if (!client) throw new NotFoundError();

  response.body = client;
};

export const updateClient = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let client = await findById(id);
  if (!client) throw new NotFoundError();

  const {
    sector,
    name,
    nit,
    verification_digit,
    business,
    city,
    address,
  } = await request.body({ type: "json" }).value;

  response.body = await client.update(
    Number(sector) || undefined,
    name,
    nit,
    Number(verification_digit) || undefined,
    business,
    Number(city) || undefined,
    address,
  );
};

export const deleteClient = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
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
