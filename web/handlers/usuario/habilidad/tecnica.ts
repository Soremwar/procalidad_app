import type { RouterContext } from "oak";
import {
  PostgresError,
} from "deno_postgres/error.ts";
import Ajv from "ajv";
import * as tecnical_experience_model from "../../../../api/models/users/technical_skill.ts";
import { NotFoundError, RequestSyntaxError } from "../../../exceptions.ts";
import { Message } from "../../../http_utils.ts";
import { tableRequestHandler } from "../../../../api/common/table.ts";
import { decodeToken } from "../../../../lib/jwt.ts";
import { castStringToBoolean } from "../../../../lib/utils/boolean.js";
import {
  BOOLEAN,
  TRUTHY_INTEGER,
} from "../../../../lib/ajv/types.js";

const update_request = {
  $id: "update",
  properties: {
    "administration": BOOLEAN,
    "development": {
      type: "string",
    },
    "installation": BOOLEAN,
    "skill": TRUTHY_INTEGER,
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "administration",
    "development",
    "installation",
    "skill",
  ],
});

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const createTechnicalSkill = async (
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

  response.body = await tecnical_experience_model.create(
    user_id,
    value.skill,
    castStringToBoolean(value.installation),
    castStringToBoolean(value.administration),
    value.development,
  )
    .catch((e) => {
      if (e instanceof PostgresError && e.fields.constraint) {
        throw new Error(
          "La habilidad para la herramienta seleccionada ya se encuentra registrada",
        );
      }
      throw new Error("No fue posible crear la habilidad tecnica");
    });
};

export const deleteTechnicalSkill = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const technical_skill = await tecnical_experience_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!technical_skill) {
    throw new NotFoundError();
  }

  try {
    await technical_skill.delete();
  } catch (_e) {
    throw new Error("No fue posible eliminar la habilidad tecnica");
  }

  response.body = Message.OK;
};

export const getTechnicalSkill = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const project = await tecnical_experience_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!project) throw new NotFoundError();

  response.body = project;
};

export const getTechnicalSkills = async (
  { cookies, response }: RouterContext,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  response.body = await tecnical_experience_model.getAll(
    user_id,
  );
};

export const getTechnicalSkillsTable = async (
  context: RouterContext,
) => {
  const session_cookie = context.cookies.get("PA_AUTH") || "";
  const { id } = await decodeToken(session_cookie);

  return tableRequestHandler(
    context,
    tecnical_experience_model.generateTableData(
      id,
    ),
  );
};

export const updateTechnicalSkill = async (
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

  const technical_skill = await tecnical_experience_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!technical_skill) {
    throw new NotFoundError();
  }

  response.body = await technical_skill.update(
    castStringToBoolean(value.installation),
    castStringToBoolean(value.administration),
    value.development,
  )
    .catch((e) => {
      if (e instanceof PostgresError && e.fields.constraint) {
        throw new Error(
          "La habilidad para la herramienta seleccionada ya se encuentra registrada",
        );
      }
      throw new Error("No fue posible actualizar la habilidad tecnica");
    });
};
