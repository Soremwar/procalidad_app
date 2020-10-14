import type { RouterContext } from "oak";
import Ajv from "ajv";
import removeAccents from "remove-accents";
import * as laboral_experience_modal from "../../../../api/models/users/laboral_experience.ts";
import { NotFoundError, RequestSyntaxError } from "../../../exceptions.ts";
import { Message } from "../../../http_utils.ts";
import { tableRequestHandler } from "../../../../api/common/table.ts";
import { decodeToken } from "../../../../lib/jwt.ts";
import {
  STANDARD_DATE_STRING,
  STRING,
  TRUTHY_INTEGER,
  UNSIGNED_NUMBER,
} from "../../../../lib/ajv/types.js";
import {
  deleteFile as deleteGenericFile,
  writeFile as writeGenericFile,
} from "../../../../api/storage/generic_file.ts";

const update_request = {
  $id: "update",
  properties: {
    "achievement_description": STRING(1000),
    "company_address": STRING(100),
    "company_city": TRUTHY_INTEGER,
    "company_name": STRING(50),
    "company_nit": UNSIGNED_NUMBER,
    "company_phone": TRUTHY_INTEGER,
    "company_sector": TRUTHY_INTEGER,
    "company_verification_digit": TRUTHY_INTEGER,
    "contact": STRING(255),
    "end_date": STANDARD_DATE_STRING,
    "function_description": STRING(1000),
    "position": STRING(100),
    "start_date": STANDARD_DATE_STRING,
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "achievement_description",
    "company_address",
    "company_city",
    "company_name",
    "company_nit",
    "company_phone",
    "company_sector",
    "company_verification_digit",
    "contact",
    "end_date",
    "function_description",
    "position",
    "start_date",
  ],
});

const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const createLaboralExperience = async (
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

  response.body = await laboral_experience_modal.create(
    user_id,
    value.company_name.toUpperCase(),
    value.company_nit,
    value.company_verification_digit,
    value.company_sector,
    value.company_city,
    value.company_address,
    value.company_phone,
    value.contact,
    value.start_date,
    value.end_date,
    value.position,
    value.function_description,
    value.achievement_description,
  )
    .catch(() => {
      throw new Error("No fue posible crear la experiencia laboral");
    });
};

export const deleteLaboralExperience = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const laboral_experience = await laboral_experience_modal.findByIdAndUser(
    id,
    user_id,
  );
  if (!laboral_experience) {
    throw new NotFoundError();
  }

  try {
    const generic_file_id = laboral_experience.generic_file;

    //Formation title should be deleted first so file constraint doesn't complain
    await laboral_experience.delete();
    if (generic_file_id) {
      await deleteGenericFile(generic_file_id);
    }
  } catch (_e) {
    throw new Error("No fue posible eliminar la experiencia laboral");
  }

  response.body = Message.OK;
};

export const getLaboralExperience = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const laboral_experience = await laboral_experience_modal.findByIdAndUser(
    id,
    user_id,
  );
  if (!laboral_experience) throw new NotFoundError();

  response.body = laboral_experience;
};

export const getLaboralExperiences = async (
  { cookies, response }: RouterContext,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  response.body = await laboral_experience_modal.getAll(
    user_id,
  );
};

export const getLaboralExperiencesTable = async (
  context: RouterContext,
) => {
  const session_cookie = context.cookies.get("PA_AUTH") || "";
  const { id } = await decodeToken(session_cookie);

  return tableRequestHandler(
    context,
    laboral_experience_modal.generateTableData(
      id,
    ),
  );
};

export const updateLaboralExperience = async (
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

  const laboral_experience = await laboral_experience_modal.findByIdAndUser(
    id,
    user_id,
  );
  if (!laboral_experience) {
    throw new NotFoundError();
  }

  response.body = await laboral_experience.update(
    value.company_nit,
    value.company_verification_digit,
    value.company_sector,
    value.company_city,
    value.company_address,
    value.company_phone,
    value.contact,
    value.start_date,
    value.end_date,
    value.position,
    value.function_description,
    value.achievement_description,
  )
    .catch((e) => {
      throw new Error("No fue posible actualizar la experiencia laboral");
    });
};

export const updateLaboralExperienceCertificate = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  let laboral_experience = await laboral_experience_modal.findByIdAndUser(
    id,
    user_id,
  );
  if (!laboral_experience) {
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

  if (laboral_experience.generic_file) {
    await writeGenericFile(
      laboral_experience.generic_file,
      user_id,
      content,
    );
  } else {
    const { id: file_id } = await writeGenericFile(
      undefined,
      user_id,
      content,
      "EXPERIENCIA_LABORAL",
      removeAccents(laboral_experience.company_name)
        .replaceAll(/[\s_]+/g, "_")
        .replaceAll(/\W/g, "")
        .toUpperCase() +
        `.${extension}`,
      max_file_size,
      allowed_extensions,
    );
    laboral_experience.generic_file = file_id;
    laboral_experience = await laboral_experience.update();
  }

  response.body = laboral_experience;
};
