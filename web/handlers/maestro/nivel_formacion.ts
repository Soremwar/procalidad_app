import { helpers, RouterContext } from "oak";
import Ajv from "ajv";
import * as formation_level_model from "../../../api/models/users/formation_level.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { Message } from "../../http_utils.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

const list_request = {
  $id: "list",
  properties: {
    "formation_type": {
      pattern: `^(${
        Object.values(formation_level_model.FormationType).join("|")
      })$`,
      type: "string",
    },
  },
};

const update_request = {
  $id: "update",
  properties: {
    "formation_type": {
      pattern: `^(${
        Object.values(formation_level_model.FormationType).join("|")
      })$`,
      type: "string",
    },
    "name": {
      maxLength: 50,
      type: "string",
    },
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "formation_type",
    "name",
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

export const createFormationLevel = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) {
    throw new RequestSyntaxError();
  }

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await formation_level_model.create(
    value.formation_type,
    value.name,
  );
};

export const deleteFormationLevel = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const formation_level = await formation_level_model.findById(id);
  if (!formation_level) {
    throw new NotFoundError();
  }

  try {
    await formation_level.delete();
  } catch (_e) {
    throw new Error("No fue posible eliminar el nivel de formación");
  }

  response.body = Message.OK;
};

export const getFormationLevel = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const formation_level = await formation_level_model.findById(id);
  if (!formation_level) throw new NotFoundError();

  response.body = formation_level;
};

export const getFormationLevels = async (context: RouterContext) => {
  const url_params = helpers.getQuery(context);

  if (!request_validator.validate("list", url_params)) {
    throw new RequestSyntaxError();
  }

  context.response.body = await formation_level_model.getAll(
    url_params.formation_type as formation_level_model.FormationType,
  );
};

export const getFormationLevelsTable = async (context: RouterContext) =>
  tableRequestHandler(
    context,
    formation_level_model.getTableData,
  );

export const updateFormationLevel = async (
  { params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("update", value)) {
    throw new RequestSyntaxError();
  }

  const formation_level = await formation_level_model.findById(id);
  if (!formation_level) {
    throw new NotFoundError();
  }

  response.body = await formation_level.update(
    value.name,
  )
    .catch(() => {
      throw new Error("No fue posible actualizar el nivel de formación");
    });
};
