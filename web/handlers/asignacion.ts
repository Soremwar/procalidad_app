import { RouterContext } from "../../web/state.ts";
import Ajv from "ajv";
import {
  createNew,
  findAll,
  findById,
  getAvailableWeeks,
  getTableData,
} from "../../api/models/OPERACIONES/asignacion.ts";
import { findById as findBudget } from "../../api/models/OPERACIONES/budget.ts";
import {
  findById as findProject,
} from "../../api/models/OPERACIONES/PROYECTO.ts";
import {
  findByDate as findWeek,
  findById as findWeekById,
  getCurrentWeek,
  getWeeksBetween,
} from "../../api/models/MAESTRO/dim_semana.ts";
import {
  findByPersonAndWeek as findControl,
  findOpenWeek as findOpenWeekOfPerson,
} from "../../api/models/OPERACIONES/control_semana.ts";
import { tableRequestHandler } from "../../api/common/table.ts";
import { Profiles } from "../../api/common/profiles.ts";
import { formatResponse, Message, Status } from "../http_utils.ts";
import {
  ForbiddenAccessError,
  NotFoundError,
  RequestSyntaxError,
} from "../exceptions.ts";
import {
  formatDateToStandardString,
  parseStandardNumber,
} from "../../lib/date/mod.js";
import { NUMBER } from "../../lib/ajv/types.js";

const update_request = {
  $id: "update",
  properties: {
    "hours": NUMBER({ min: 0, multipleOf: 0.5 }),
  },
  required: [
    "hours",
  ],
};

const request_validator = new Ajv({
  coerceTypes: true,
  schemas: [
    update_request,
  ],
});

export const createAssignation = async (
  { request, response, state }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  //TODO
  //Add JSON validation
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

  const project_data = await findProject(budget_data.fk_proyecto);
  if (!project_data) {
    throw new NotFoundError("El proyecto seleccionado no existe");
  }

  const has_admin_access = state.user.profiles.some((profile) =>
    [
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ].includes(profile)
  );

  const allowed_editors = await project_data.getSupervisors();
  const has_project_access = allowed_editors.includes(state.user.id);
  if (!has_project_access && !has_admin_access) {
    throw new ForbiddenAccessError(
      "Usted no tiene permiso para asignar sobre este proyecto",
    );
  }

  const parsed_date = parseStandardNumber(date);

  const open_week_control = await findOpenWeekOfPerson(person);
  if (!open_week_control) {
    throw new RequestSyntaxError(
      "La persona solicitada no se encuentra habilitada para registrar horas",
    );
  }

  const open_week = await findWeekById(open_week_control.week);
  if (!open_week) {
    throw new Error(
      "No fue posible obtener la información de la fecha requerida",
    );
  }

  //TODO
  //Don't allow dates that are less than two months older to the current assignation
  if (!has_admin_access) {
    if (
      (parsed_date as Date).getTime() < open_week.start_date.getTime()
    ) {
      throw new RequestSyntaxError(
        "Debe solicitar una fecha superior a la semana registrada actualmente",
      );
    }
  }

  const week = await findWeek(Number(date));
  if (!week) {
    throw new Error("La fecha de la asignación es inválida");
  }

  response.body = await createNew(
    Number(person),
    Number(budget),
    Number(role),
    week.id,
    Number(date),
    Number(hours),
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

export const getAssignations = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getAssignationsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const getAssignationWeeks = async (
  { response, state }: RouterContext,
) => {
  const has_admin_access = state.user.profiles.some((profile) =>
    [
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ].includes(profile)
  );

  if (!has_admin_access) {
    const current_week = await getCurrentWeek();

    const start_date = new Date(current_week.start_date.getTime());
    start_date.setMonth(current_week.start_date.getMonth() - 2);

    response.body = await getWeeksBetween(
      formatDateToStandardString(start_date),
      formatDateToStandardString(current_week.start_date),
    );
  } else {
    response.body = await getAvailableWeeks();
  }
};

export const updateAssignation = async (
  { params, request, response, state }: RouterContext<{ id: string }>,
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

  const project_data = await findProject(budget_data.fk_proyecto);
  if (!project_data) {
    throw new NotFoundError("El proyecto seleccionado no existe");
  }

  const has_admin_access = state.user.profiles.some((profile) =>
    [
      Profiles.ADMINISTRATOR,
      Profiles.CONTROLLER,
      Profiles.HUMAN_RESOURCES,
    ].includes(profile)
  );

  const allowed_editors = await project_data.getSupervisors();
  const has_project_access = allowed_editors.includes(state.user.id);

  if (!has_project_access && !has_admin_access) {
    throw new ForbiddenAccessError(
      "Usted no tiene permiso para asignar sobre este proyecto",
    );
  }

  const value: {
    hours: number;
  } = await request.body({ type: "json" }).value;
  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  const control = await findControl(state.user.id, resource.week);
  if (!control) {
    throw new NotFoundError(
      "La semana solicitada no se encuentra disponible para asignación",
    );
  }

  // Special behaviour for admin access
  // They can edit closed assignations, as long as they don't remove
  // hours from the original assignation
  if (control.closed) {
    if (!has_admin_access) {
      throw new RequestSyntaxError(
        "La semana solicitada no se encuentra disponible para asignación",
      );
    }
    if (Number(resource.hours) > Number(value.hours)) {
      throw new RequestSyntaxError(
        "Esta semana se encuentra cerrada. No es posible disminuir la cantidad de horas asignadas al proyecto",
      );
    }
  }

  response.body = await resource.update(
    value.hours,
  );
};
