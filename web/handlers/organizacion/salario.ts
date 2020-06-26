import { RouterContext, Body } from "oak";
import {
  createNew,
  findAll,
  findById,
  getCalculatedResult,
  getTableData,
  TipoSalario,
  personHasCost,
} from "../../../api/models/ORGANIZACION/salario.ts";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {tableRequestHandler} from "../../../api/common/table.ts";

export const getSalaries = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getSalariesTable = async (context: RouterContext) => tableRequestHandler(
  context,
  getTableData,
);

export const createSalary = async ({ request, response }: RouterContext) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    person,
    computer,
    labour_cost,
    bonus_cost,
    licenses,
    other,
    salary_type,
    validity,
  } = await request.body().then((x: Body) => x.value);

  if (
    !(
      Number(person) &&
      Number(computer) &&
      !isNaN(Number(labour_cost)) &&
      !isNaN(Number(bonus_cost)) &&
      Array.isArray(licenses) &&
      !isNaN(Number(other)) &&
      salary_type &&
      !isNaN(new Date(validity).getTime())
    )
  ) {
    throw new RequestSyntaxError();
  }

  const person_has_cost: boolean = await personHasCost(person);

  if(person_has_cost) throw new Error("El coste para la persona ya ha sido calculado");

  const salary = await createNew(
    Number(person),
    Number(computer),
    Number(labour_cost),
    Number(bonus_cost),
    licenses.map(Number).filter(Boolean),
    Number(other),
    salary_type in TipoSalario ? salary_type as TipoSalario : TipoSalario.I,
    new Date(validity),
  );

  response.body = salary;
};

export const getCalculatedSalary = async (
  { request, response }: RouterContext,
) => {
  const {
    labour_cost,
    bonus_cost,
    licenses,
    other,
    salary_type,
    computer,
  } = await request.body().then((x: Body) => x.value);

  if(!(salary_type && Number(computer))) throw new RequestSyntaxError();

  response.body = await getCalculatedResult(
    Number(labour_cost) || 0,
    Number(bonus_cost) || 0,
    Array.isArray(licenses) ? licenses.map(Number).filter(Boolean) : [],
    Number(other) || 0,
    salary_type in TipoSalario ? salary_type as TipoSalario : TipoSalario.O,
    Number(computer),
  );
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

  const {
    computer,
    labour_cost,
    bonus_cost,
    licenses,
    other,
    salary_type,
    validity,
  } = await request.body().then((x: Body) => x.value);

  salary = await salary.update(
    isNaN(Number(computer)) ? undefined : Number(computer),
    isNaN(Number(labour_cost)) ? undefined : Number(labour_cost),
    isNaN(Number(bonus_cost)) ? undefined : Number(bonus_cost),
    Array.isArray(licenses) ? undefined : licenses.map(Number).filter(Boolean),
    isNaN(Number(other)) ? undefined : Number(other),
    salary_type in TipoSalario ? salary_type as TipoSalario : TipoSalario.I,
    !isNaN(new Date(validity).getTime()) ? new Date(validity) : undefined,
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
