import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getCalculatedResult,
  getTableData,
  TipoSalario,
} from "../../../api/models/ORGANIZACION/salario.ts";
import { TableOrder, Order } from "../../../api/common/table.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getSalaries = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getSalariesTable = async ({ request, response }:
  RouterContext) => {
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

export const createSalary = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    person,
    computer,
    labour_cost,
    bonus_cost,
    license_cost,
    other,
    salary_type,
  }: { [x: string]: string } = await request.body()
    .then((x: Body) => Object.fromEntries(x.value));

  if (
    !(
      Number(person) &&
      Number(computer) &&
      !isNaN(Number(labour_cost)) &&
      !isNaN(Number(bonus_cost)) &&
      !isNaN(Number(license_cost)) &&
      !isNaN(Number(other)) &&
      salary_type
    )
  ) {
    throw new RequestSyntaxError();
  }

  const salary = await createNew(
    Number(person),
    Number(computer),
    Number(labour_cost),
    Number(bonus_cost),
    Number(license_cost),
    Number(other),
    salary_type in TipoSalario ? salary_type as TipoSalario : TipoSalario.I,
  );

  response.body = salary;
};

export const getCalculatedSalary = async (
  { request, response }: RouterContext,
) => {
  const {
    labour_cost,
    bonus_cost,
    license_cost,
    other,
    salary_type,
  }: { [x: string]: string } = Object.fromEntries(
      request.searchParams.entries(),
  );

  const result = await getCalculatedResult(
    Number(labour_cost) || 0,
    Number(bonus_cost) || 0,
    Number(license_cost) || 0,
    Number(other) || 0,
    salary_type in TipoSalario ? salary_type as TipoSalario : TipoSalario.O,
  );

  response.body = result;
};

export const getSalary = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const salary = await findById(id);
  if (!salary) throw new NotFoundError();

  response.body = salary;
};

export const updateSalary = async (
  { params, request, response }: RouterContext,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let salary = await findById(id);
  if (!salary) throw new NotFoundError();

  const raw_attributes: Array<[string, string]> = await request.body()
    .then((x: Body) => Array.from(x.value));

  const {
    person,
    computer,
    labour_cost,
    bonus_cost,
    license_cost,
    other,
    salary_type,
  }: {
    person?: string;
    computer?: string;
    labour_cost?: string;
    bonus_cost?: string;
    license_cost?: string;
    other?: string;
    salary_type?: string;
  } = Object.fromEntries(raw_attributes.filter(([_, value]) => value));

  salary = await salary.update(
    isNaN(Number(person)) ? undefined : Number(person),
    isNaN(Number(computer)) ? undefined : Number(computer),
    isNaN(Number(labour_cost)) ? undefined : Number(labour_cost),
    isNaN(Number(bonus_cost)) ? undefined : Number(bonus_cost),
    isNaN(Number(license_cost)) ? undefined : Number(license_cost),
    isNaN(Number(other)) ? undefined : Number(other),
    salary_type in TipoSalario ? salary_type as TipoSalario : TipoSalario.I,
  );

  response.body = salary;
};

export const deleteSalary = async ({ params, response }: RouterContext) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let salary = await findById(id);
  if (!salary) throw new NotFoundError();

  await salary.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
