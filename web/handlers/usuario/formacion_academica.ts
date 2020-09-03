import { RouterContext } from "oak";
import removeAccents from "remove-accents";
import Ajv from "ajv";
import { FormationType } from "../../../api/models/users/formation_level.ts";
import * as formation_title_model from "../../../api/models/users/formation_title.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { Message } from "../../http_utils.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { decodeToken } from "../../../lib/jwt.ts";
import { castStringToBoolean } from "../../../lib/utils/boolean.js";
import {
  writeGenericFile,
} from "../../../api/storage/uploads.ts";
import {
  BOOLEAN,
  STANDARD_DATE_STRING,
  STANDARD_DATE_STRING_OR_NULL,
  TRUTHY_INTEGER,
} from "../../../lib/ajv/types.js";

const update_request = {
  $id: "update",
  properties: {
    "city": TRUTHY_INTEGER,
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
    "city",
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

export const createAcademicFormationTitle = async (
  { request, response }: RouterContext,
) => {
  if (!request.hasBody) {
    throw new RequestSyntaxError();
  }

  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("create", value)) {
    throw new RequestSyntaxError();
  }

  response.body = await formation_title_model.create(
    value.formation_level,
    value.title,
    value.institution,
    value.start_date,
    value.end_date,
    value.city,
    null,
    castStringToBoolean(value.status),
  );
};

export const deleteAcademicFormationTitle = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const formation_title = await formation_title_model.findById(id);
  if (!formation_title) {
    throw new NotFoundError();
  }

  try {
    await formation_title.delete();
  } catch (_e) {
    throw new Error("No fue posible eliminar el título de formación");
  }

  response.body = Message.OK;
};

export const getAcademicFormationTitle = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const formation_title = await formation_title_model.findById(id);
  if (!formation_title) throw new NotFoundError();

  response.body = formation_title;
};

export const getAcademicFormationTitles = async (
  { response }: RouterContext,
) => {
  response.body = await formation_title_model.getAll(
    FormationType.Academica,
  );
};

export const getAcademicFormationTitlesTable = async (
  context: RouterContext,
) => {
  const session_cookie = context.cookies.get("PA_AUTH") || "";
  const { id } = await decodeToken(session_cookie);

  return tableRequestHandler(
    context,
    formation_title_model.generateTableData(
      FormationType.Academica,
      id,
    ),
  );
};

export const updateAcademicFormationTitle = async (
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

  const formation_title = await formation_title_model.findById(id);
  if (!formation_title) {
    throw new NotFoundError();
  }

  response.body = await formation_title.update(
    value.title,
    value.institution,
    value.start_date,
    value.end_date,
    value.city,
    null,
    castStringToBoolean(value.status),
  )
    .catch(() => {
      throw new Error("No fue posible actualizar el título de formación");
    });
};

export const updateAcademicFormationTitleCertificate = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  let formation_title = await formation_title_model.findById(id);
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
  } = form.files[0];
  if (!content) {
    throw new RequestSyntaxError("Tamaño maximo de archivo excedido");
  }

  //TODO
  //Validate extension and size

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
      "FORMACION_ACADEMICA",
      removeAccents(formation_title.title)
        .replaceAll(/[\s_]+/g, "_")
        .replaceAll(/\W/g, "")
        .toUpperCase(),
      10,
      ["pdf", "jpg", "png"],
    );
    formation_title.generic_file = file_id;
    formation_title = await formation_title.update();
  }

  response.body = formation_title;
};
