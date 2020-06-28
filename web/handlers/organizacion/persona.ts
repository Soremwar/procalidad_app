import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  TipoIdentificacion,
} from "../../../api/models/ORGANIZACION/PERSONA.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

export const getPeople = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getPeopleTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

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

export const getPerson = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const person = await findById(id);
  if (!person) throw new NotFoundError();

  response.body = person;
};

export const updatePerson = async (
  { params, request, response }: RouterContext<{ id: string }>,
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

export const deletePerson = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
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
