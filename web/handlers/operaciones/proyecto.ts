import { Body, RouterContext } from "oak";
import {
  createNew,
  findAll,
  findById,
  getTableData,
  searchByNameAndClient,
} from "../../../api/models/OPERACIONES/PROYECTO.ts";
import {
  findById as findProjectType,
} from "../../../api/models/OPERACIONES/TIPO_PROYECTO.ts";
import { Profiles } from "../../../api/common/profiles.ts";
import { decodeToken } from "../../../lib/jwt.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { formatResponse, Message, Status } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";

export const getProjects = async ({ response }: RouterContext) => {
  response.body = await findAll();
};

export const getProjectsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    getTableData,
  );

export const createProject = async (
  { cookies, request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();

  const {
    type,
    client,
    sub_area,
    name,
    supervisor,
    description,
    status,
  } = await request.body({ type: "json" }).value;

  if (
    !(
      Number(type) &&
      Number(client) &&
      Number(sub_area) &&
      name &&
      Number(supervisor) &&
      description &&
      Number.isInteger(Number(status))
    )
  ) {
    throw new RequestSyntaxError();
  }

  const project_type = await findProjectType(Number(Number(type)));
  if (!project_type) {
    throw new Error("El tipo de proyecto seleccionado no fue encontrado");
  }

  //Ignore cause this is already validated but TypeScript is too dumb to notice
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { profiles } = await decodeToken(session_cookie);

  if (project_type.ban_facturable) {
    const can_create_facturable_project = profiles.some((profile: number) =>
      [
        Profiles.SALES,
        Profiles.CONTROLLER,
        Profiles.ADMINISTRATOR,
      ].includes(profile)
    );

    if (!can_create_facturable_project) {
      throw new Error(
        "Su rol actual no le permite crear proyectos facturables",
      );
    }
  }

  response.body = await createNew(
    Number(type),
    Number(client),
    Number(sub_area),
    name,
    Number(supervisor),
    description,
    Number(status),
  );
};

export const getProject = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  const project = await findById(id);
  if (!project) throw new NotFoundError();

  response.body = project;
};

export const searchProject = async ({ response, request }: RouterContext) => {
  const {
    client: param_client,
    query: param_query,
    limit: param_limit,
  }: { [x: string]: string } = Object.fromEntries(
    request.url.searchParams.entries(),
  );

  const client: number = Number(param_client);
  const query: string = param_query;
  const limit: number = Number(param_limit) || 0;

  if (!client) throw new RequestSyntaxError();
  response.body = await searchByNameAndClient(client, query, limit);
};

export const updateProject = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!request.hasBody || !id) throw new RequestSyntaxError();

  let project = await findById(id);
  if (!project) throw new NotFoundError();

  const {
    client,
    sub_area,
    name,
    supervisor,
    description,
    status,
  } = await request.body({ type: "json" }).value;

  //Ignore cause this is already validated but TypeScript is too dumb to notice
  const session_cookie = cookies.get("PA_AUTH") || "";
  const {
    id: user_id,
    profiles: user_profiles,
  } = await decodeToken(session_cookie);

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
      throw new Error("Su rol actual no le permite editar este proyecto");
    }
  }

  response.body = await project.update(
    Number(client) || undefined,
    Number(sub_area) || undefined,
    name,
    Number(supervisor) || undefined,
    description,
    Number.isInteger(Number(status)) ? Number(status) : undefined,
  );
};

export const deleteProject = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id: number = Number(params.id);
  if (!id) throw new RequestSyntaxError();

  let project = await findById(id);
  if (!project) throw new NotFoundError();

  await project.delete();
  response = formatResponse(
    response,
    Status.OK,
    Message.OK,
  );
};
