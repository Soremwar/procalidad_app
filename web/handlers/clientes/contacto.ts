import { RouterContext, Body } from "oak";
import {
  findAll,
  findById,
  createNew,
  getTableData,
} from "../../../api/models/CLIENTES/CONTACTO.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

export const getContacts = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getContactsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createContact = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    area,
    position,
    client,
    phone,
    phone_2,
    email,
  }: { [x: string]: string } = await request.body({ type: "json" }).value;

  if (
    !(name && Number(client) && phone && email)
  ) {
    throw new RequestSyntaxError();
  }

  await createNew(
    name,
    area || null,
    position || null,
    Number(client),
    phone,
    phone_2 || null,
    email,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getContact = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const contact = await findById(id);
  if (!contact) throw new NotFoundError();

  response.body = contact;
};

export const updateContact = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let contact = await findById(id);
  if (!contact) throw new NotFoundError();

  const {
    name,
    area,
    position,
    client,
    phone,
    phone_2,
    email,
  }: {
    name?: string;
    area?: string;
    position?: string;
    client?: string;
    phone?: string;
    phone_2?: string;
    email?: string;
  } = await request.body({ type: "json" }).value;

  contact = await contact.update(
    name,
    area,
    position,
    Number(client) || undefined,
    phone,
    phone_2,
    email,
  );

  response.body = contact;
};

export const deleteContact = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
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
