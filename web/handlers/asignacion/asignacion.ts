import { Body, RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/asignacion/asignacion.ts";
import { addLaboralDays } from "../../../api/models/MAESTRO/dim_tiempo.ts";
import {
  tableRequestHandler,
} from "../../../api/common/table.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { parseStandardNumber } from "../../../lib/date/mod.js";

export const getAssignations = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getAssignationsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createAssignation = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    person,
    budget,
    role,
    start_date,
    assignation,
    hours,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (
    !(
      Number(person) &&
      Number(budget) &&
      Number(role) &&
      parseStandardNumber(start_date) &&
      Number(assignation) >= 0 && Number(assignation) <= 100 &&
      Number(hours)
    )
  ) {
    throw new RequestSyntaxError();
  }

  //TODO
  //Reemplazar 9 por calculo de horas laborales diarias
  const end_date = await addLaboralDays(
    Number(start_date),
    Math.ceil(Number(hours) / 9 * 100 / Number(assignation)),
  );

  response.body = await createNew(
    Number(person),
    Number(budget),
    Number(role),
    Number(start_date),
    end_date,
    Number(assignation),
    Number(hours),
  );
};

export const getAssignation = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const resource = await findById(id);
  if (!resource) throw new NotFoundError();

  response.body = resource;
};

export const updateAssignation = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let resource = await findById(id);
  if (!resource) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    person,
    budget,
    role,
    start_date,
    assignation,
    hours,
  }: {
    person?: string;
    budget?: string;
    role?: string;
    start_date?: string;
    assignation?: string;
    hours?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  //TODO
  //Reemplazar 9 por calculo de horas laborales diarias
  const end_date = await addLaboralDays(
    Number(start_date),
    Math.ceil(Number(hours) / 9 * 100 / Number(assignation)),
  );

  response.body = await resource.update(
    Number(person) || undefined,
    Number(budget) || undefined,
    Number(role) || undefined,
    parseStandardNumber(start_date) ? Number(start_date) : undefined,
    end_date,
    Number(assignation) >= 0 && Number(assignation) <= 100
      ? Number(assignation)
      : undefined,
    Number(hours) || undefined,
  );
};

export const deleteAssignation = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let resource = await findById(id);
  if (!resource) throw new NotFoundError();

  await resource.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
