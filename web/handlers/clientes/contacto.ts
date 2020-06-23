import { RouterContext, Body } from "oak";
import {
  findAll,
  findById,
  createNew,
  getTableData
} from "../../../api/models/CLIENTES/CONTACTO.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getContacts = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getContactsTable = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    order = {},
    page,
    rows,
    search = {},
  } = await request.body().then((x: Body) => x.value);

  if (!(
    order instanceof Object &&
    search instanceof Object
  )) throw new RequestSyntaxError();

  const order_parameters = Object.entries(order).reduce(
    (res: TableOrder, [index, value]: [string, any]) => {
      if (value in Order) {
        res[index] = value as Order;
      }
      return res;
    },
    {} as TableOrder,
  );

  const data = await getTableData(
    order_parameters,
    page || 0,
    rows || null,
    search,
  );

  response.body = data;
};

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
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

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
    .then((x: Body) => Array.from(x.value));

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
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

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
