import { Body, RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
  searchByParameter,
} from "../../../api/models/MAESTRO/parametro_definicion.ts";
import {
  findById as findParameterById,
  TipoParametro,
} from "../../../api/models/MAESTRO/parametro.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getParameterDefinitions = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

//TODO
//Add validations for date overlapping
export const createParameterDefinition = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let parameter = await findParameterById(id);
  if (!parameter) throw new NotFoundError();

  const {
    start_date,
    end_date,
    value,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (parameter.tipo_parametro === TipoParametro.percentage) {
    if (Number(value) < 0 || Number(value) > 100) {
      throw new RequestSyntaxError();
    }
  }

  if (
    !(
      Number(id) &&
      start_date &&
      end_date &&
      value
    )
  ) {
    throw new RequestSyntaxError();
  }

  const definition = await createNew(
    Number(id),
    new Date(start_date),
    new Date(end_date),
    value,
  );

  response.body = definition;
};

export const getParameterDefinition = async (
  { params, response }: RouterContext<{ id: string }>,
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
    request.url.searchParams.entries(),
  );

  if (!Number(param_parameter)) throw new RequestSyntaxError();

  const parameter: number = Number(param_parameter);
  const limit: number = Number(param_limit) || 0;

  response.body = await searchByParameter(parameter, limit);
};

//TODO
//Add validations for date overlapping
export const updateParameterDefinition = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let definition = await findById(id);
  if (!definition) throw new NotFoundError();

  const parameter = await findParameterById(definition.fk_parametro);
  if (!parameter) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    start_date,
    end_date,
    value,
  }: {
    start_date?: string;
    end_date?: string;
    value?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  let cleaned_value: string | undefined = value;

  if (parameter.tipo_parametro === TipoParametro.percentage) {
    if (Number(value) < 0 || Number(value) > 100) {
      cleaned_value = undefined;
    }
  }

  definition = await definition.update(
    new Date(start_date),
    new Date(end_date),
    cleaned_value,
  );

  response.body = definition;
};

export const deleteParameterDefinition = async (
  { params, response }: RouterContext<{ id: string }>,
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
