import { RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  TipoIdentificacion,
} from "../../../api/models/ORGANIZACION/people.ts";
import { Message } from "../../http_utils.ts";
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
  } = await request.body({ type: "json" }).value;

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

  response.body = await createNew(
    type in TipoIdentificacion
      ? type as TipoIdentificacion
      : TipoIdentificacion.CC,
    identification,
    name,
    phone,
    email,
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

  const {
    type,
    identification,
    name,
    phone,
  } = await request.body({ type: "json" }).value;

  person = await person.update(
    type in TipoIdentificacion
      ? type as TipoIdentificacion
      : TipoIdentificacion.CC,
    identification,
    undefined,
    undefined,
    name,
    phone,
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
  response.body = Message.OK;
};
