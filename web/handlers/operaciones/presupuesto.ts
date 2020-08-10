import { RouterContext, Body } from "oak";
import {
  createNew as createBudgetItem,
  findAll as findBudgetItems,
  findById as findBudgetItem,
  getTableData as getBudgetItemTable,
} from "../../../api/models/OPERACIONES/budget.ts";
import {
  createNew as createBudgetDetail,
  deleteByBudget as deleteBudgetDetail,
  findByBudget as findBudgetDetail,
} from "../../../api/models/OPERACIONES/PRESUPUESTO_DETALLE.ts";
import {
  findById as findProject,
} from "../../../api/models/OPERACIONES/PROYECTO.ts";
import { Profiles } from "../../../api/common/profiles.ts";
import { validateJwt } from "djwt/validate.ts";
import { encryption_key } from "../../../config/api_deno.js";
import { Status, Message, formatResponse } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

export const getBudgets = async ({ response }: RouterContext) => {
  response.body = await findBudgetItems();
};

export const getBudgetTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getBudgetItemTable,
  );

export const createBudget = async (
  { cookies, request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    project,
    budget_type,
    name,
    description,
    status,
    roles,
  } = await request.body().then((x: Body) => x.value);

  if (
    !(
      Number(project) &&
      Number(budget_type) &&
      name &&
      description &&
      !isNaN(Number(status)) &&
      Array.isArray(roles)
    )
  ) {
    throw new RequestSyntaxError();
  }

  const project_model = await findProject(Number(project));
  if (!project_model) throw new Error("El proyecto seleccionado no existe");

  //Ignore cause this is already validated but TypeScript is too dumb to notice
  const session_cookie = cookies.get("PA_AUTH");
  //@ts-ignore
  const session = await validateJwt(session_cookie, encryption_key);
  //@ts-ignore
  const { profiles: user_profiles, id: user_id } = session.payload?.context
    ?.user;

  const allowed_editors = await project_model.getSupervisors();
  if (!allowed_editors.includes(user_id)) {
    if (
      !user_profiles.some((profile: number) =>
        [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ].includes(profile)
      )
    ) {
      throw new Error("Su rol actual no le permite crear este presupuesto");
    }
  }

  const budget_id = await createBudgetItem(
    Number(project),
    Number(budget_type),
    name,
    description,
    Boolean(Number(status)),
  );

  for (const role of roles) {
    if (!Number(role.id)) continue;
    await createBudgetDetail(
      budget_id,
      Number(role.id),
      Number(role.time) || 0,
      Number(role.price) || 0,
    );
  }

  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};

export const getBudget = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const budget = await findBudgetItem(id);
  if (!budget) throw new NotFoundError();

  const detail = await findBudgetDetail(id);

  response.body = { ...budget, roles: detail };
};

export const updateBudget = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let budget = await findBudgetItem(id);
  if (!budget) throw new NotFoundError();
  if (!budget.estado) {
    throw new Error("No es posible editar un presupuesto cerrado");
  }

  const project = await findProject(budget.fk_proyecto);
  if (!project) throw new Error("El proyecto seleccionado no existe");

  //Ignore cause this is already validated but TypeScript is too dumb to notice
  const session_cookie = cookies.get("PA_AUTH");
  //@ts-ignore
  const session = await validateJwt(session_cookie, encryption_key);
  //@ts-ignore
  const { profiles: user_profiles, id: user_id } = session.payload?.context
    ?.user;

  const allowed_editors = await project.getSupervisors();
  if (!allowed_editors.includes(user_id)) {
    if (
      !user_profiles.some((profile: number) =>
        [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ].includes(profile)
      )
    ) {
      throw new Error("Su rol actual no le permite editar este presupuesto");
    }
  }

  const {
    budget_type,
    name,
    description,
    status,
    roles,
  } = await request.body().then((x: Body) => x.value);

  budget = await budget.update(
    Number(budget_type) || undefined,
    name,
    description,
    !isNaN(Number(status)) ? Boolean(Number(status)) : undefined,
  );

  await deleteBudgetDetail(id);
  for (const role of roles) {
    if (!Number(role.id)) continue;
    await createBudgetDetail(
      id,
      Number(role.id),
      Number(role.time) || 0,
      Number(role.price) || 0,
    );
  }

  response.body = budget;
};

export const deleteBudget = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let budget = await findBudgetItem(id);
  if (!budget) throw new NotFoundError();

  await deleteBudgetDetail(id);

  await budget.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
