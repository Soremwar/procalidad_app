import {
  Body,
  RouterContext,
} from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
} from "../../../api/models/planeacion/recurso.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {
  parseStandardNumber,
} from "../../../lib/date/mod.js";

// @deno-types="https://deno.land/x/types/moment/v2.26.0/moment.d.ts"
import moment from 'https://cdn.pika.dev/moment@2.26.0';

export const getResources = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getResourcesTable = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    order = {},
    page,
    rows,
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

  const data = await getTableData(
    order_parameters,
    page || 0,
    rows || null,
  );

  response.body = data;
};

const addWeekdays = (date_str: Date, days: number) => {
  let date: any = moment(date_str)
  while(days > 0) {
    date = date.add(1, 'days');
    if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
      days -= 1;
    }
  }
  return date;
}

export const createResource = async ({ request, response }: RouterContext) => {
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

  if (!(
    Number(person) &&
    Number(budget) &&
    Number(role) &&
    parseStandardNumber(start_date) &&
    Number(assignation) >= 0 && Number(assignation) <= 100 &&
    Number(hours)
  )) {
    throw new RequestSyntaxError();
  }

  //Reemplazar 9 por calculo de horas laborales diarias
  const end_date = addWeekdays(
    moment(start_date, 'YYYYMMDD').toDate(),
    Number(hours) / 9 * 100 / Number(assignation) - 1,
  );

  const position = await createNew(
    Number(person),
    Number(budget),
    Number(role),
    Number(start_date),
    end_date.format('YYYYMMDD'),
    Number(assignation),
    Number(hours),
  );

  response.body = position;
};

export const getResource = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const resource = await findById(id);
  if (!resource) throw new NotFoundError();

  response.body = resource;
};

export const updateResource = async (
  { params, request, response }: RouterContext,
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

  //Reemplazar 9 por calculo de horas laborales diarias
  const end_date = addWeekdays(
    moment(start_date, 'YYYYMMDD').toDate(),
    Number(hours) / 9 * 100 / Number(assignation) - 1,
  );

  resource = await resource.update(
    Number(person) || undefined,
    Number(budget) || undefined,
    Number(role) || undefined,
    parseStandardNumber(start_date) ? Number(start_date) : undefined,
    Number(end_date.format('YYYYMMDD')),
    Number(assignation) >= 0 && Number(assignation) <= 100 ? Number(assignation) : undefined,
    Number(hours) || undefined,
  );

  response.body = resource;
};

export const deleteResource = async ({ params, response }: RouterContext) => {
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
