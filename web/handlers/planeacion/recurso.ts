import {Body, RouterContext,} from "oak";
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
  getTableData,
  HeatmapFormula,
} from "../../../api/models/planeacion/recurso.ts";
import {addLaboralDays,} from "../../../api/models/MAESTRO/dim_tiempo.ts";

import {Order, TableOrder} from "../../../api/common/table.ts";
import {formatResponse, Message, Status} from "../../http_utils.ts";
import {NotFoundError, RequestSyntaxError} from "../../exceptions.ts";
import {parseStandardNumber,} from "../../../lib/date/mod.js";

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

  if (!(
    order instanceof Object &&
    search instanceof Object
  )) throw new RequestSyntaxError();

  const order_parameters = Object.entries(order).reduce(
    (res: TableOrder, [index, value]: [string, any]) => {
      if (value in Order) {
        res[index] = value as Order;
      }
      return res;
    },
    {} as TableOrder,
  );

  const table_type = type in ResourceViewType ? type as ResourceViewType : ResourceViewType.project;

  if(table_type === ResourceViewType.project){
    response.body = await getTableData(
      order_parameters,
      page || 0,
      rows || null,
      search,
    );
  }else if (table_type === ResourceViewType.resource){
    response.body = await getResourceTableData(
      order_parameters,
      page || 0,
      rows || null,
    );
  }else if (table_type === ResourceViewType.detail){
    response.body = await getDetailTableData(
      order_parameters,
      page || 0,
      rows || null,
      search,
    );
  }
};

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

  //TODO
  //Reemplazar 9 por calculo de horas laborales diarias
  const end_date = await addLaboralDays(
    Number(start_date),
    Math.ceil(Number(hours) / 9 * 100 / Number(assignation)),
  );

  const position = await createNew(
    Number(person),
    Number(budget),
    Number(role),
    Number(start_date),
    end_date,
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

  //TODO
  //Reemplazar 9 por calculo de horas laborales diarias
  const end_date = await addLaboralDays(
    Number(start_date),
    Math.ceil(Number(hours) / 9 * 100 / Number(assignation)),
  );

  resource = await resource.update(
    Number(person) || undefined,
    Number(budget) || undefined,
    Number(role) || undefined,
    parseStandardNumber(start_date) ? Number(start_date) : undefined,
    end_date,
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

export const getResourcesGantt = async ({ request, response }: RouterContext) => {
  const {
    person,
    project,
    type,
  }: { [x: string]: string } = Object.fromEntries(
    request.searchParams.entries(),
  );

  const gantt_type = type in ResourceViewType ? type as ResourceViewType : ResourceViewType.project;

  if(gantt_type === ResourceViewType.project){
    response.body = await getProjectGanttData(
      Number(project) || undefined,
    );
  }else if (gantt_type === ResourceViewType.resource){
    response.body = await getResourceGanttData();
  }else if (gantt_type === ResourceViewType.detail){
    response.body = await getDetailGanttData(
      Number(person) || undefined,
    );
  }
};

export const getResourcesHeatmap = async ({ request, response }: RouterContext) => {
  const {
    formula,
    person,
    type,
  }: { [x: string]: string } = Object.fromEntries(
    request.searchParams.entries(),
  );

  const heatmap_type = type == ResourceViewType.resource || type == ResourceViewType.detail
    ? type as ResourceViewType
    : ResourceViewType.resource;

  const heatmap_formula = formula in HeatmapFormula ? formula as HeatmapFormula : HeatmapFormula.occupation;
  if (heatmap_type === ResourceViewType.resource){
    response.body = await getResourceHeatmapData(
      heatmap_formula,
    );
  }else if (heatmap_type === ResourceViewType.detail){
    if(!Number(person)) throw new RequestSyntaxError();

    response.body = await getDetailHeatmapData(
      Number(person),
    );
  }
};
