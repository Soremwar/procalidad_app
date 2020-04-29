import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  TipoIdentificacion,
} from "../../../api/models/ORGANIZACION/PERSONA.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getPeople = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getPeopleTable = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    order = {},
    page,
    rows,
    search,
  } = await request.body().then((x: Body) => x.value);

  if (!(order instanceof Object)) throw new RequestSyntaxError();

  const order_parameters = Object.entries(order).reduce(
    (res: TableOrder, [index, value]: [string, any]) => {
      if (value in Order) {
        res[index] = value as Order;
      }
      return res;
    },
    {} as TableOrder,
  );

  const search_query = ["string", "number"].includes(typeof search)
    ? String(search)
    : "";

  const data = await getTableData(
    order_parameters,
    page || 0,
    rows || null,
    search_query,
  );

  response.body = data;
};

export const createPerson = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    type,
    identification,
    name,
    phone,
    email,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (
    !(
      type &&
      identification &&
      name &&
      phone &&
      email
    )
  ) {
    throw new RequestSyntaxError();
  }

  await createNew(
    type in TipoIdentificacion
      ? type as TipoIdentificacion
      : TipoIdentificacion.CC,
    identification,
    name,
    phone,
    email,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getPerson = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const person = await findById(id);
  if (!person) throw new NotFoundError();

  response.body = person;
};

export const updatePerson = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let person = await findById(id);
  if (!person) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    type,
    identification,
    name,
    phone,
    email,
  }: {
    type?: string;
    identification?: string;
    name?: string;
    phone?: string;
    email?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  person = await person.update(
    type in TipoIdentificacion
      ? type as TipoIdentificacion
      : TipoIdentificacion.CC,
    identification,
    name,
    phone,
    email,
  );

  response.body = person;
};

export const deletePerson = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let person = await findById(id);
  if (!person) throw new NotFoundError();

  await person.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
