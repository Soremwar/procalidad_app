import { RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  TipoParametro,
} from "../../../api/models/MAESTRO/parametro.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

export const getParameters = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getParametersTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createParameter = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    name,
    description,
    type,
  } = await request.body({ type: "json" }).value;

  if (
    !(
      name &&
      description &&
      type
    )
  ) {
    throw new RequestSyntaxError();
  }

  response.body = await createNew(
    name,
    description,
    type in TipoParametro ? type as TipoParametro : TipoParametro.string,
  );
};

export const getParameter = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const parameter = await findById(id);
  if (!parameter) throw new NotFoundError();

  response.body = parameter;
};

export const updateParameter = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let parameter = await findById(id);
  if (!parameter) throw new NotFoundError();

  const {
    name,
    description,
    type,
  } = await request.body({ type: "json" }).value;

  response.body = await parameter.update(
    name,
    description,
    type in TipoParametro ? type as TipoParametro : TipoParametro.string,
  );
};

export const deleteParameter = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let parameter = await findById(id);
  if (!parameter) throw new NotFoundError();

  await parameter.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
