import type { RouterContext } from "oak";
import removeAccents from "remove-accents";
import Ajv from "ajv";
import * as certification_model from "../../../api/models/users/certification.ts";
import {
  Certification,
  findById as findTemplate,
} from "../../../api/models/users/certification_template.ts";
import { findById as findType } from "../../../api/models/users/certification_type.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { Message } from "../../http_utils.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { decodeToken } from "../../../lib/jwt.ts";
import {
  deleteFile as deleteGenericFile,
  writeFile as writeGenericFile,
} from "../../../api/storage/generic_file.ts";
import {
  STANDARD_DATE_STRING,
  STANDARD_DATE_STRING_OR_NULL,
  STRING,
  STRING_OR_NULL,
  TRUTHY_INTEGER,
} from "../../../lib/ajv/types.js";

const update_request = {
  $id: "update",
  properties: {
    "expedition_date": STANDARD_DATE_STRING,
    "expiration_date": STANDARD_DATE_STRING_OR_NULL,
    "name": STRING(50),
    "template": TRUTHY_INTEGER,
    "type": TRUTHY_INTEGER,
    "version": STRING_OR_NULL({ length: 10 }),
  },
};

const create_request = Object.assign({}, update_request, {
  $id: "create",
  required: [
    "expedition_date",
    "expiration_date",
    "name",
    "template",
    "type",
    "version",
  ],
});

const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const createCertification = async (
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

  if (
    await certification_model.Certification.nameIsTaken(
      user_id,
      value.template,
      value.type,
      value.name,
      //Value could be null, default to empty
      value.version || "",
    )
  ) {
    throw new RequestSyntaxError(
      "Los parametros de la certificacion se encuentran duplicados",
    );
  }

  response.body = await certification_model.create(
    user_id,
    value.template,
    value.type,
    value.name,
    value.version,
    value.expedition_date,
    value.expiration_date,
  );
};

export const deleteCertification = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const certification = await certification_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!certification) {
    throw new NotFoundError();
  }

  try {
    const generic_file_id = certification.generic_file;

    //Parent should be deleted first so file constraint doesn't complain
    await certification.delete();
    if (generic_file_id) {
      await deleteGenericFile(generic_file_id);
    }
  } catch (_e) {
    throw new Error("No fue posible eliminar el certificado");
  }

  response.body = Message.OK;
};

export const getCertification = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const certification = await certification_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!certification) throw new NotFoundError();

  response.body = certification;
};

export const getCertifications = async (
  { cookies, response }: RouterContext,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  response.body = await certification_model.getAll(
    user_id,
  );
};

export const getCertificationsTable = async (
  context: RouterContext,
) => {
  const session_cookie = context.cookies.get("PA_AUTH") || "";
  const { id } = await decodeToken(session_cookie);

  return tableRequestHandler(
    context,
    certification_model.generateTableData(
      id,
    ),
  );
};

export const updateCertification = async (
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

  const certification = await certification_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!certification) {
    throw new NotFoundError();
  }

  if (
    await certification_model.Certification.nameIsTaken(
      user_id,
      certification.template,
      value.type,
      value.name,
      certification.version || "",
      certification.id,
    )
  ) {
    throw new RequestSyntaxError(
      "Los parametros de la certificacion se encuentran duplicados",
    );
  }

  response.body = await certification.update(
    value.type,
    value.name,
    value.expedition_date,
    value.expiration_date,
  )
    .catch(() => {
      throw new Error("No fue posible actualizar el certificado");
    });
};

export const updateCertificationFile = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  let certification = await certification_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!certification) {
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

  if (certification.generic_file) {
    await writeGenericFile(
      certification.generic_file,
      user_id,
      content,
    );
  } else {
    const type = await findType(certification.type);
    if (!type) {
      throw new Error("No se encontro el tipo de certificado");
    }
    const template = await findTemplate(certification.template);
    if (!template) {
      throw new Error("No se encontro la configuracion del certificado");
    }

    const { id: file_id } = await writeGenericFile(
      undefined,
      user_id,
      content,
      "CERTIFICACIONES",
      removeAccents([
        type.getCode(),
        template.name,
        certification.name,
        certification.version || "",
      ].join(" "))
        .replaceAll(/[\s_]+/g, "_")
        .replaceAll(/[^\w\.]/g, "")
        .toUpperCase() +
        `.${extension}`,
      max_file_size,
      allowed_extensions,
    );
    certification.generic_file = file_id;
    certification = await certification.update();
  }

  response.body = certification;
};
