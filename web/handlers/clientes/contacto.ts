import { RouterContext, Body } from "oak";
import {
  findAll,
  findById,
  createNew
} from "../../../api/models/CLIENTES/CONTACTO.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getContacts = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const createContact = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const { name, email, phone }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value.params));

  if (!(name && email && phone)) throw new RequestSyntaxError();

  await createNew(name, email, phone);
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getContact = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const contact = await findById(id);
  if (!contact) throw new NotFoundError();

  response.body = contact;
};

export const updateContact = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let contact = await findById(id);
  if (!contact) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value.params));

  const { name, email, phone }: {
    name?: string;
    email?: string;
    phone?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  contact = await contact.update(name, email, phone);
  response.body = contact;
};

export const deleteContact = async ({ params, response }: RouterContext) => {
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
