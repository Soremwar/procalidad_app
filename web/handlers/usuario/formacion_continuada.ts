import type { RouterContext } from "oak";
import Ajv from "ajv";
import removeAccents from "remove-accents";
import { FormationType } from "../../../api/models/users/formation_level.ts";
import * as formation_title_model from "../../../api/models/users/formation_title.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { Message } from "../../http_utils.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { decodeToken } from "../../../lib/jwt.ts";
import { castStringToBoolean } from "../../../lib/utils/boolean.js";
import {
  BOOLEAN,
  STANDARD_DATE_STRING,
  STANDARD_DATE_STRING_OR_NULL,
  TRUTHY_INTEGER,
} from "../../../lib/ajv/types.js";
import {
  deleteFile as deleteGenericFile,
  writeFile as writeGenericFile,
} from "../../../api/storage/generic_file.ts";

const update_request = {
  $id: "update",
  properties: {
    "end_date": STANDARD_DATE_STRING_OR_NULL,
    "formation_level": TRUTHY_INTEGER,
    "institution": {
      maxLength: 50,
      type: "string",
    },
    "start_date": STANDARD_DATE_STRING,
    "status": BOOLEAN,
    "title": {
      maxLength: 50,
      type: "string",
    },
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "end_date",
    "formation_level",
    "institution",
    "start_date",
    "status",
    "title",
  ],
});

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const createContinuousFormationTitle = async (
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

  response.body = await formation_title_model.create(
    value.formation_level,
    user_id,
    value.title,
    value.institution,
    value.start_date,
    value.end_date,
    null,
    null,
    castStringToBoolean(value.status),
  );
};

export const deleteContinuousFormationTitle = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const continuous_title = await formation_title_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!continuous_title) {
    throw new NotFoundError();
  }

  try {
    let generic_file_id = continuous_title.generic_file;

    //Formation title should be deleted first so file constraint doesn't complain
    await continuous_title.delete();
    if (generic_file_id) {
      await deleteGenericFile(generic_file_id);
    }
  } catch (_e) {
    throw new Error("No fue posible eliminar el título de formacion");
  }

  response.body = Message.OK;
};

export const getContinuousFormationTitle = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const formation_title = await formation_title_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!formation_title) throw new NotFoundError();

  response.body = formation_title;
};

export const getContinuousFormationTitles = async (
  { cookies, response }: RouterContext,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  response.body = await formation_title_model.getAll(
    FormationType.Continuada,
    user_id,
  );
};

export const getContinuousFormationTitlesTable = async (
  context: RouterContext,
) => {
  const session_cookie = context.cookies.get("PA_AUTH") || "";
  const { id } = await decodeToken(session_cookie);

  return tableRequestHandler(
    context,
    formation_title_model.generateTableData(
      FormationType.Continuada,
      id,
    ),
  );
};

export const updateContinuousFormationTitle = async (
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

  const formation_title = await formation_title_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!formation_title) {
    throw new NotFoundError();
  }

  response.body = await formation_title.update(
    value.institution,
    value.start_date,
    value.end_date,
    null,
    undefined,
    null,
    castStringToBoolean(value.status),
  )
    .catch(() => {
      throw new Error("No fue posible actualizar el título de formación");
    });
};

export const updateContinuousFormationTitleCertificate = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  let formation_title = await formation_title_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!formation_title) {
    throw new NotFoundError();
  }

  const form = await request.body({ type: "form-data" }).value.read({
    maxSize: 10000000,
  });
  if (!form.files || !form.files.length) {
    throw new RequestSyntaxError();
  }
  const {
    content,
    name: file_name,
  } = form.files[0];
  if (!content) {
    throw new RequestSyntaxError("Tamaño maximo de archivo excedido");
  }

  /* In MegaBytes */
  const max_file_size = 10;
  const allowed_extensions = ["pdf", "jpg", "png"];

  const [_, extension] = file_name.split(/\.(?=[^\.]+$)/);
  if (!allowed_extensions.includes(extension)) {
    throw new RequestSyntaxError(
      `El certificado cargado no es un tipo de archivo permitido: ${extension}`,
    );
  }
  if (content.length / 1024 / 1024 > max_file_size) {
    throw new RequestSyntaxError(
      "El archivo excede el tamaño máximo permitido",
    );
  }

  if (formation_title.generic_file) {
    await writeGenericFile(
      formation_title.generic_file,
      user_id,
      content,
    );
  } else {
    const { id: file_id } = await writeGenericFile(
      undefined,
      user_id,
      content,
      "FORMACION_CONTINUADA",
      removeAccents(formation_title.title)
        .replaceAll(/[\s_]+/g, "_")
        .replaceAll(/\W/g, "")
        .toUpperCase() +
        `.${extension}`,
      max_file_size,
      allowed_extensions,
    );
    formation_title.generic_file = file_id;
    formation_title = await formation_title.update();
  }

  response.body = formation_title;
};
