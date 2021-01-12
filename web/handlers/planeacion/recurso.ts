import Ajv from "ajv";
import type { RouterContext } from "oak";
import { decodeToken } from "../../../lib/jwt.ts";
import {
  createNew,
  findAll,
  findById,
  getDetailGanttData,
  getDetailHeatmapData,
  getDetailTableData,
  getProjectGanttData,
  getProjectTableData,
  getResourceGanttData,
  getResourceHeatmapData,
  getResourceTableData,
  HeatmapFormula,
} from "../../../api/models/planeacion/recurso.ts";
import { addLaboralDays } from "../../../api/models/MAESTRO/dim_tiempo.ts";
import {
  getCurrentWeek,
  findByDate as findWeekByDate,
} from "../../../api/models/MAESTRO/dim_semana.ts";
import {
  findOpenBudgetByProject as findBudget,
} from "../../../api/models/OPERACIONES/budget.ts";
import {
  findById as findProject,
} from "../../../api/models/OPERACIONES/PROYECTO.ts";
import { parseOrderFromObject } from "../../../api/common/table.ts";
import { Profiles } from "../../../api/common/profiles.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {
  formatStandardStringToStandardNumber,
  parseDateToStandardNumber,
  parseStandardNumber,
} from "../../../lib/date/mod.js";
import {
  INTEGER,
  NUMBER,
  STANDARD_DATE_STRING,
  TRUTHY_INTEGER,
  TRUTHY_INTEGER_OR_EMPTY,
} from "../../../lib/ajv/types.js";

const update_request = {
  $id: "update",
  properties: {
    "assignation": INTEGER({min: 1, max: 100}),
    "hours": NUMBER(0.5),
    "person": INTEGER({min: 1}),
    "role": INTEGER({min: 1}),
    "start_date": STANDARD_DATE_STRING,
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "assignation",
    "hours",
    "person",
    "role",
    "start_date",
  ],
});

const heatmap_resource_request = {
  $id: "heatmap_resource",
  properties: {
    "type": {
      pattern: `^(${Object.values(HeatmapFormula).join("|")})$`,
      type: "string",
    },
    "sub_area": TRUTHY_INTEGER_OR_EMPTY,
    "position": TRUTHY_INTEGER_OR_EMPTY,
    "role": TRUTHY_INTEGER_OR_EMPTY,
  },
  required: [
    "type",
    "sub_area",
    "position",
    "role",
  ],
};

const heatmap_detail_request = {
  $id: "heatmap_detail",
  properties: {
    "person": TRUTHY_INTEGER,
  },
  required: [
    "person",
  ],
};

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
    heatmap_detail_request,
    heatmap_resource_request,
  ],
});

enum ResourceViewType {
  project = "project",
  resource = "resource",
  detail = "detail",
}

export const createResource = async (
  { cookies, request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;
  if(!request_validator.validate("create", value)){
    throw new RequestSyntaxError();
  }

  const budget = await findBudget(value.project);
  if (!budget) {
    throw new NotFoundError("No existe un presupuesto abierto para el proyecto seleccionado");
  }

  const session_cookie = cookies.get("PA_AUTH") || "";
  const {
    id: user_id,
    profiles: user_profiles,
  } = await decodeToken(session_cookie);

  const project = await findProject(value.project);
  if (!project) {
    throw new NotFoundError("El proyecto seleccionado no existe");
  }
  
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
      throw new Error(
        "Usted no tiene permiso para planear sobre este proyecto",
      );
    }
  }

  const start_date = formatStandardStringToStandardNumber(value.start_date);
  const start_date_week = await findWeekByDate(start_date);
  const today_week = await getCurrentWeek();
  if (!start_date_week || !today_week) {
    throw new Error("Ocurrio un error al procesar las fechas de la planeacion");
  }
  if (today_week.start_date > start_date_week.start_date) {
    throw new Error(
      "La planeacion solo se puede crear hacia futuro",
    );
  }

  //TODO
  //Reemplazar 9 por calculo de horas laborales diarias
  const end_date = await addLaboralDays(
    start_date,
    Math.ceil(value.hours / 9 * 100 / value.assignation),
  );

  response.body = await createNew(
    value.person,
    budget.pk_presupuesto,
    value.role,
    start_date,
    end_date,
    value.assignation,
    value.hours,
  );
};

export const deleteResource = async (
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

export const getResource = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const resource = await findById(id);
  if (!resource) throw new NotFoundError();

  response.body = resource;
};

export const getResources = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getResourcesGantt = async (
  { request, response }: RouterContext,
) => {
  const {
    person,
    project,
    type,
  }: { [x: string]: string } = Object.fromEntries(
    request.url.searchParams.entries(),
  );

  const gantt_type = type in ResourceViewType
    ? type as ResourceViewType
    : ResourceViewType.project;

  if (gantt_type === ResourceViewType.project) {
    response.body = await getProjectGanttData(
      Number(project),
    );
  } else if (gantt_type === ResourceViewType.resource) {
    response.body = await getResourceGanttData();
  } else if (gantt_type === ResourceViewType.detail) {
    response.body = await getDetailGanttData(
      Number(person) || undefined,
    );
  }
};

export const getResourcesHeatmap = async (
  { request, response }: RouterContext,
) => {
  const {
    type: heatmap_type_string,
  }: { [x: string]: string } = Object.fromEntries(
    request.url.searchParams.entries(),
  );
  if (!request.hasBody) throw new RequestSyntaxError();

  const request_value = await request.body({ type: "json" }).value;

  const heatmap_type = heatmap_type_string == ResourceViewType.resource ||
      heatmap_type_string == ResourceViewType.detail
    ? heatmap_type_string as ResourceViewType
    : ResourceViewType.resource;

  if (heatmap_type === ResourceViewType.resource) {
    if (
      !request_validator.validate("heatmap_resource", request_value)
    ) {
      throw new RequestSyntaxError();
    }
    response.body = await getResourceHeatmapData(
      request_value.type as HeatmapFormula,
      Number(request_value.sub_area) || undefined,
      Number(request_value.position) || undefined,
      Number(request_value.role) || undefined,
    );
  } else if (heatmap_type === ResourceViewType.detail) {
    if (
      !request_validator.validate("heatmap_detail", request_value)
    ) {
      throw new RequestSyntaxError();
    }
    response.body = await getDetailHeatmapData(
      Number(request_value.person),
    );
  }
};

export const getResourcesTable = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    filters = {},
    order = {},
    page,
    rows,
    search = {},
    type,
  } = await request.body({ type: "json" }).value;

  if (
    !(
      filters instanceof Object &&
      order instanceof Object &&
      search instanceof Object
    )
  ) {
    throw new RequestSyntaxError();
  }

  const order_parameters = parseOrderFromObject(order);
  const table_type = type in ResourceViewType
    ? type as ResourceViewType
    : ResourceViewType.project;

  if (table_type === ResourceViewType.project) {
    response.body = await getProjectTableData(
      order_parameters,
      page || 0,
      rows || null,
      filters,
      search,
    );
  } else if (table_type === ResourceViewType.resource) {
    response.body = await getResourceTableData(
      order_parameters,
      page || 0,
      rows || null,
      filters,
      search,
    );
  } else if (table_type === ResourceViewType.detail) {
    response.body = await getDetailTableData(
      order_parameters,
      page || 0,
      rows || null,
      filters,
      search,
    );
  }
};

export const updateResource = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let resource = await findById(id);
  if (!resource) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;
  if(!request_validator.validate("update", value)){
    throw new RequestSyntaxError();
  }

  const session_cookie = cookies.get("PA_AUTH") || "";
  const {
    id: user_id,
    profiles: user_profiles,
  } = await decodeToken(session_cookie);

  const {
    person,
    role,
    start_date: stard_date_string,
    assignation,
    hours,
  } = await request.body({ type: "json" }).value;

  let start_date = formatStandardStringToStandardNumber(value.start_date);

  const budget = await findBudget(value.project);
  if (!budget) {
    throw new NotFoundError("No existe un presupuesto abierto para el proyecto seleccionado");
  }

  const project = await findProject(value.project);
  if (!project) {
    throw new NotFoundError("El proyecto seleccionado no existe");
  }

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
      throw new Error(
        "Usted no tiene permiso para planear sobre este proyecto",
      );
    }
  }

  //TODO
  //Reemplazar 9 por calculo de horas laborales diarias
  const end_date = await addLaboralDays(
    start_date,
    Math.ceil(Number(hours) / 9 * 100 / Number(assignation)),
  );

  const start_date_week = await findWeekByDate(start_date);
  const today_week = await getCurrentWeek();
  if (!start_date_week || !today_week) {
    throw new Error("Ocurrio un error al procesar las fechas de la planeacion");
  }
  if (today_week.start_date > start_date_week.start_date) {
    throw new Error(
      "La planeacion solo se puede crear hacia futuro",
    );
  }

  response.body = await resource.update(
    value.person,
    budget.pk_presupuesto,
    value.role,
    start_date,
    end_date,
    value.assignation,
    value.hours,
  );;
};
