import { RouterContext } from "oak";
import { decodeToken } from "../../lib/jwt.ts";
import {
  createNew,
  findAll,
  findById,
  getAvailableWeeks,
  getTableData,
} from "../../api/models/OPERACIONES/asignacion.ts";
import {
  findById as findBudget,
} from "../../api/models/OPERACIONES/budget.ts";
import {
  findById as findProject,
} from "../../api/models/OPERACIONES/PROYECTO.ts";
import {
  tableRequestHandler,
} from "../../api/common/table.ts";
import { Profiles } from "../../api/common/profiles.ts";
import { formatResponse, Message, Status } from "../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../exceptions.ts";
import { parseStandardNumber } from "../../lib/date/mod.js";

export const getAssignations = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getAssignationsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createAssignation = async (
  { cookies, request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    person,
    budget,
    role,
    date,
    hours,
  } = await request.body({ type: "json" }).value;

  if (
    !(
      Number(person) &&
      Number(budget) &&
      Number(role) &&
      parseStandardNumber(date) &&
      Number(hours)
    )
  ) {
    throw new RequestSyntaxError();
  }

  const budget_data = await findBudget(Number(budget));
  if (!budget_data) {
    throw new NotFoundError("El presupuesto seleccionado no existe");
  }
  if (!budget_data.estado) {
    throw new Error("El presupuesto para esta asignacion se encuentra cerrado");
  }

  //Ignore cause this is already validated but TypeScript is too dumb to notice
  const session_cookie = cookies.get("PA_AUTH") || "";
  const {
    id: user_id,
    profiles: user_profiles,
  } = await decodeToken(session_cookie);

  const project_data = await findProject(budget_data.fk_proyecto);
  if (!project_data) {
    throw new NotFoundError("El proyecto seleccionado no existe");
  }
  const allowed_editors = await project_data.getSupervisors();
  if (!allowed_editors.includes(user_id)) {
    if (
      !user_profiles.some((profile: number) =>
        [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ].includes(profile)
      )
    ) {
      throw new Error(
        "Usted no tiene permiso para asignar sobre este proyecto",
      );
    }
  }

  response.body = await createNew(
    Number(person),
    Number(budget),
    Number(role),
    Number(date),
    Number(hours),
  );
};

export const updateAssignation = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let resource = await findById(id);
  if (!resource) throw new NotFoundError();

  const budget_data = await findBudget(resource.budget);
  if (!budget_data) {
    throw new NotFoundError("El presupuesto seleccionado no existe");
  }
  if (!budget_data.estado) {
    throw new Error("El presupuesto para esta asignacion se encuentra cerrado");
  }

  //Ignore cause this is already validated but TypeScript is too dumb to notice
  const session_cookie = cookies.get("PA_AUTH") || "";
  const {
    id: user_id,
    profiles: user_profiles,
  } = await decodeToken(session_cookie);

  const project_data = await findProject(budget_data.fk_proyecto);
  if (!project_data) {
    throw new NotFoundError("El proyecto seleccionado no existe");
  }
  const allowed_editors = await project_data.getSupervisors();
  if (!allowed_editors.includes(user_id)) {
    if (
      !user_profiles.some((profile: number) =>
        [
          Profiles.ADMINISTRATOR,
          Profiles.CONTROLLER,
        ].includes(profile)
      )
    ) {
      throw new Error(
        "Usted no tiene permiso para asignar sobre este proyecto",
      );
    }
  }

  const {
    hours,
  } = await request.body({ type: "json" }).value;

  response.body = await resource.update(
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

  const budget_data = await findBudget(resource.budget);
  if (!budget_data) {
    throw new NotFoundError("El presupuesto seleccionado no existe");
  }
  if (!budget_data.estado) {
    throw new Error("El presupuesto para esta asignacion se encuentra cerrado");
  }

  await resource.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
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

export const getAssignationWeeks = async (
  { response }: RouterContext,
) => {
  response.body = await getAvailableWeeks();
};
