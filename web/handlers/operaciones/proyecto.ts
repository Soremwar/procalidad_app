import { helpers, RouterContext } from "oak";
import Ajv from "ajv";
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
import { Message } from "../../http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { BOOLEAN, TRUTHY_INTEGER } from "../../../lib/ajv/types.js";
import { castStringToBoolean } from "../../../lib/utils/boolean.js";

const list_request = {
  $id: "list",
  properties: {
    "assignated_only": BOOLEAN,
  },
};

const update_request = {
  $id: "update",
  properties: {
    "client": TRUTHY_INTEGER,
    "description": {
      type: "string",
    },
    "name": {
      maxLength: 255,
      type: "string",
    },
    "status": TRUTHY_INTEGER,
    "sub_area": TRUTHY_INTEGER,
    "supervisor": TRUTHY_INTEGER,
    "type": TRUTHY_INTEGER,
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  "required": [
    "client",
    "description",
    "name",
    "status",
    "sub_area",
    "supervisor",
    "type",
  ],
});

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    create_request,
    list_request,
    update_request,
  ],
});

export const getProjects = async (context: RouterContext) => {
  const session_cookie = context.cookies.get("PA_AUTH") || "";
  const { id } = await decodeToken(session_cookie);
  const url_params = helpers.getQuery(context);

  if (!request_validator.validate("list", url_params)) {
    throw new RequestSyntaxError();
  }

  context.response.body = await findAll(
    castStringToBoolean(url_params.assignated_only || false),
    id,
  );
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

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  const project_type = await findProjectType(value.type);
  if (!project_type) {
    throw new Error("El tipo de proyecto seleccionado no fue encontrado");
  }

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
    value.type,
    value.client,
    value.sub_area,
    value.name,
    value.supervisor,
    value.description,
    value.status,
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

  const value = await request.body({ type: "json" }).value;

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
    value.client,
    value.sub_area,
    value.name,
    value.supervisor,
    value.description,
    value.status,
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

  response.body = Message.OK;
};
