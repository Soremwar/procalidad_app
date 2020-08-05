import Ajv from "ajv";
import { Body, RouterContext } from "oak";
import { validateJwt } from "djwt/validate.ts";
import {
  createNew,
  findAll,
  findById,
  getDetailGanttData,
  getDetailTableData,
  getProjectGanttData,
  getDetailHeatmapData,
  getResourceGanttData,
  getResourceHeatmapData,
  getResourceTableData,
  getProjectTableData,
  HeatmapFormula,
} from "../../../api/models/planeacion/recurso.ts";
import { addLaboralDays } from "../../../api/models/MAESTRO/dim_tiempo.ts";
import {
  findByDate as findWeekByDate,
} from "../../../api/models/MAESTRO/dim_semana.ts";
import {
  findById as findBudget,
} from "../../../api/models/OPERACIONES/budget.ts";
import {
  findById as findProject,
} from "../../../api/models/OPERACIONES/PROYECTO.ts";
import {
  parseOrderFromObject,
} from "../../../api/common/table.ts";
import { encryption_key } from "../../../config/api_deno.js";
import { Profiles } from "../../../api/common/profiles.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {
  parseDateToStandardNumber,
  parseStandardNumber,
} from "../../../lib/date/mod.js";
import {
  TRUTHY_INTEGER,
  TRUTHY_INTEGER_OR_EMPTY,
} from "../../../lib/ajv/types.js";

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
    heatmap_detail_request,
    heatmap_resource_request,
  ],
});

enum ResourceViewType {
  project = "project",
  resource = "resource",
  detail = "detail",
}

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
    search = {},
    type,
  } = await request.body().then((x: Body) => x.value);

  if (
    !(
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
      search,
    );
  } else if (table_type === ResourceViewType.resource) {
    response.body = await getResourceTableData(
      order_parameters,
      page || 0,
      rows || null,
      search,
    );
  } else if (table_type === ResourceViewType.detail) {
    response.body = await getDetailTableData(
      order_parameters,
      page || 0,
      rows || null,
      search,
    );
  }
};

export const createResource = async (
  { cookies, request, response }: RouterContext,
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

  const budget_data = await findBudget(Number(budget));
  if (!budget_data) {
    throw new NotFoundError("El presupuesto seleccionado no existe");
  }
  if (!budget_data.estado) {
    throw new Error("El presupuesto seleccionado esta cerrado");
  }

  //Ignore cause this is already validated but TypeScript is too dumb to notice
  const session_cookie = cookies.get("PA_AUTH");
  //@ts-ignore
  const session = await validateJwt(session_cookie, encryption_key);
  //@ts-ignore
  const { profiles: user_profiles, id: user_id } = session.payload?.context
    ?.user;

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
        "Usted no tiene permiso para planear sobre este proyecto",
      );
    }
  }

  const start_date_week = await findWeekByDate(Number(start_date));
  const today_week = await findWeekByDate(
    parseDateToStandardNumber(new Date()),
  );
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

export const getResource = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const resource = await findById(id);
  if (!resource) throw new NotFoundError();

  response.body = resource;
};

export const updateResource = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
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
    start_date: stard_date_string,
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

  let start_date: number;
  if (!parseStandardNumber(stard_date_string) || !Number(budget)) {
    throw new RequestSyntaxError();
  } else {
    start_date = Number(stard_date_string);
  }

  const budget_data = await findBudget(Number(budget));
  if (!budget_data) throw new Error("El presupuesto seleccionado no existe");
  if (!budget_data.estado) {
    throw new Error("El presupuesto seleccionado esta cerrado");
  }

  //Ignore cause this is already validated but TypeScript is too dumb to notice
  const session_cookie = cookies.get("PA_AUTH");
  //@ts-ignore
  const session = await validateJwt(session_cookie, encryption_key);
  //@ts-ignore
  const { profiles: user_profiles, id: user_id } = session.payload?.context
    ?.user;

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
  const today_week = await findWeekByDate(
    parseDateToStandardNumber(new Date()),
  );
  if (!start_date_week || !today_week) {
    throw new Error("Ocurrio un error al procesar las fechas de la planeacion");
  }
  if (today_week.start_date > start_date_week.start_date) {
    throw new Error(
      "La planeacion solo se puede crear hacia futuro",
    );
  }

  resource = await resource.update(
    Number(person) || undefined,
    Number(budget),
    Number(role) || undefined,
    start_date,
    end_date,
    Number(assignation) >= 0 && Number(assignation) <= 100
      ? Number(assignation)
      : undefined,
    Number(hours) || undefined,
  );

  response.body = resource;
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

  const {
    type: request_type,
    value: request_value,
  }: Body = await request.body();
  if (request_type !== "json") throw new RequestSyntaxError();

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
