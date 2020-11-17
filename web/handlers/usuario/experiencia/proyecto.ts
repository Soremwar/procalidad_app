import type { RouterContext } from "oak";
import Ajv from "ajv";
import * as project_experience_model from "../../../../api/models/users/project_experience.ts";
import { NotFoundError, RequestSyntaxError } from "../../../exceptions.ts";
import { Message } from "../../../http_utils.ts";
import {
  deleteReview,
  requestReview,
} from "../../../../api/reviews/user_project_experience.ts";
import { tableRequestHandler } from "../../../../api/common/table.ts";
import { decodeToken } from "../../../../lib/jwt.ts";
import { castStringToBoolean } from "../../../../lib/utils/boolean.js";
import {
  BOOLEAN,
  NUMBER,
  PHONE,
  STANDARD_DATE_STRING,
  STRING,
  TRUTHY_INTEGER,
} from "../../../../lib/ajv/types.js";

const update_request = {
  $id: "update",
  properties: {
    "client_city": TRUTHY_INTEGER,
    "client_name": STRING(255),
    "functions": STRING(1000),
    "project_contact_name": STRING(255),
    "project_contact_phone": PHONE,
    "project_description": STRING(100),
    "project_end_date": STANDARD_DATE_STRING,
    "project_is_internal": BOOLEAN,
    "project_name": STRING(200),
    "project_participation": NUMBER(0, 100),
    "project_start_date": STANDARD_DATE_STRING,
    "roles": {
      items: {
        maxLength: 20,
        type: "string",
      },
      minItems: 1,
      type: "array",
      uniqueItems: true,
    },
    "tools_used": {
      items: {
        maxLength: 40,
        type: "string",
      },
      minItems: 1,
      type: "array",
      uniqueItems: true,
    },
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "client_city",
    "client_name",
    "functions",
    "project_contact_name",
    "project_contact_phone",
    "project_description",
    "project_end_date",
    "project_is_internal",
    "project_name",
    "project_participation",
    "project_start_date",
    "roles",
    "tools_used",
  ],
});

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const createProjectExperience = async (
  { cookies, request, response }: RouterContext,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  if (!request.hasBody) {
    throw new RequestSyntaxError();
  }

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  const project_experience = await project_experience_model.create(
    user_id,
    value.client_name.toUpperCase(),
    value.client_city,
    value.project_name,
    value.project_description,
    value.tools_used,
    value.roles,
    value.functions,
    value.project_start_date,
    value.project_end_date,
    castStringToBoolean(value.project_is_internal),
    value.project_contact_name,
    value.project_contact_phone,
    value.project_participation,
  )
    .catch(() => {
      throw new Error("No fue posible crear la experiencia de proyecto");
    });

  await requestReview(String(project_experience.id));

  response.body = project_experience;
};

export const deleteProjectExperience = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const project_experience = await project_experience_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!project_experience) {
    throw new NotFoundError();
  }

  try {
    await deleteReview(String(project_experience.id));
    await project_experience.delete();
  } catch (_e) {
    throw new Error("No fue posible eliminar la experiencia de proyecto");
  }

  response.body = Message.OK;
};

export const getProjectExperience = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const project = await project_experience_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!project) throw new NotFoundError();

  response.body = project;
};

export const getProjectExperiences = async (
  { cookies, response }: RouterContext,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  response.body = await project_experience_model.getAll(
    user_id,
  );
};

export const getProjectExperiencesTable = async (
  context: RouterContext,
) => {
  const session_cookie = context.cookies.get("PA_AUTH") || "";
  const { id } = await decodeToken(session_cookie);

  return tableRequestHandler(
    context,
    project_experience_model.generateTableData(
      id,
    ),
  );
};

export const updateProjectExperience = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  const project_experience = await project_experience_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!project_experience) {
    throw new NotFoundError();
  }

  await project_experience.update(
    value.client_name.toUpperCase(),
    value.client_city,
    value.project_name,
    value.project_description,
    value.tools_used,
    value.roles,
    value.functions,
    value.project_start_date,
    value.project_end_date,
    castStringToBoolean(value.project_is_internal),
    value.project_contact_name,
    value.project_contact_phone,
    value.project_participation,
  )
    .catch(() => {
      throw new Error("No fue posible actualizar la experiencia de proyecto");
    });

  await requestReview(String(project_experience.id));

  response.body = project_experience;
};
