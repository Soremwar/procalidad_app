import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  searchByParameter,
  ValorParametro,
} from "../../../api/models/MAESTRO/parametro_definicion.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getParameterDefinitions = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const createParameterDefinition = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    parameter,
    start_date,
    end_date,
    valor,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (
    !(
      Number(parameter) &&
      start_date &&
      end_date &&
      valor
    )
  ) {
    throw new RequestSyntaxError();
  }

  await createNew(
    Number(parameter),
    new Date(start_date),
    new Date(end_date),
    valor,
  );

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getParameterDefinition = async (
  { params, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const definition = await findById(id);
  if (!definition) throw new NotFoundError();

  response.body = definition;
};

export const searchParameterDefinition = async (
  { response, request }: RouterContext,
) => {
  const {
    parameter: param_parameter,
    limit: param_limit,
  }: { [x: string]: string } = Object.fromEntries(
    request.searchParams.entries(),
  );

  if (!Number(param_parameter)) throw new RequestSyntaxError();

  const parameter: number = Number(param_parameter);
  const limit: number = Number(param_limit) || 0;

  response.body = await searchByParameter(parameter, limit);
};

export const updateParameterDefinition = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let definition = await findById(id);
  if (!definition) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    start_date,
    end_date,
    valor,
  }: {
    start_date?: string;
    end_date?: string;
    valor?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  definition = await definition.update(
    new Date(start_date),
    new Date(end_date),
    valor,
  );

  response.body = definition;
};

export const deleteParameterDefinition = async (
  { params, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let definition = await findById(id);
  if (!definition) throw new NotFoundError();

  await definition.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
