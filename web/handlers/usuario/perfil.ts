import type { RouterContext } from "oak";
import Ajv from "ajv";
import { decodeToken } from "../../../lib/jwt.ts";
import { findReviewById } from "../../../api/models/ORGANIZACION/people.ts";
import * as children_model from "../../../api/models/users/children.ts";
import * as contact_model from "../../../api/models/users/contact.ts";
import * as file_model from "../../../api/models/files/template_file.ts";
import * as language_model from "../../../api/models/users/language_experience.ts";
import { requestReview as requestDocumentsReview } from "../../../api/reviews/user_documents.ts";
import { requestReview as requestIdentificationReview } from "../../../api/reviews/user_identification.ts";
import { requestReview as requestPersonalDataReview } from "../../../api/reviews/user_personal_data.ts";
import { requestReview as requestResidenceReview } from "../../../api/reviews/user_residence.ts";
import { TipoSangre } from "../../../api/models/enums.ts";
import {
  findByCode as findParameter,
} from "../../../api/models/MAESTRO/parametro.ts";
import {
  getActiveDefinition as findParameterValue,
} from "../../../api/models/MAESTRO/parametro_definicion.ts";
import { getDetailHeatmapData } from "../../../api/models/planeacion/recurso.ts";
import { getFileFormatCode } from "../../../api/parameters.ts";
import {
  getFile as getTemplateFile,
  writeFile as writeTemplateFile,
} from "../../../api/storage/template_file.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import {
  CELLPHONE,
  STANDARD_DATE_STRING,
  STANDARD_DATE_STRING_OR_NULL,
  STRING,
  STRING_OR_NULL,
  TRUTHY_INTEGER,
  TRUTHY_INTEGER_OR_NULL,
} from "../../../lib/ajv/types.js";
import { Message } from "../../http_utils.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";

const children_request = {
  $id: "children",
  properties: {
    "gender": TRUTHY_INTEGER,
    "name": STRING(255),
    "born_date": STANDARD_DATE_STRING,
  },
  required: [
    "gender",
    "name",
    "born_date",
  ],
};

const contact_request = {
  $id: "contact",
  properties: {
    "cellphone": CELLPHONE,
    "employee_relationship": STRING(
      undefined,
      undefined,
      Object.values(contact_model.Relationships),
    ),
    "name": STRING(255),
  },
  required: [
    "cellphone",
    "employee_relationship",
    "name",
  ],
};

const information_request = {
  $id: "information",
  properties: {
    "birth_date": STANDARD_DATE_STRING_OR_NULL,
    "birth_city": TRUTHY_INTEGER_OR_NULL,
    "blood_type": STRING_OR_NULL({
      values: Object.values(TipoSangre),
    }),
    "document_expedition_date": STANDARD_DATE_STRING_OR_NULL,
    "document_expedition_city": TRUTHY_INTEGER_OR_NULL,
    "gender": TRUTHY_INTEGER_OR_NULL,
    "marital_status": TRUTHY_INTEGER_OR_NULL,
    "military_passbook": TRUTHY_INTEGER_OR_NULL,
    "personal_email": STRING_OR_NULL({ max: 320 }),
    "phone": TRUTHY_INTEGER_OR_NULL,
    "professional_card_expedition": STANDARD_DATE_STRING_OR_NULL,
    "residence_address": STRING_OR_NULL({ max: 95 }),
    "residence_city": TRUTHY_INTEGER_OR_NULL,
  },
};

const language_request = {
  $id: "language",
  properties: {
    "language": TRUTHY_INTEGER,
    "read_skill": {
      pattern: `^[${Object.values(language_model.SkillLevel).join("")}]$`,
      type: "string",
    },
    "write_skill": {
      pattern: "^[ABD]$",
      type: "string",
    },
    "talk_skill": {
      pattern: "^[ABD]$",
      type: "string",
    },
    "listen_skill": {
      pattern: "^[ABD]$",
      type: "string",
    },
  },
  required: [
    "language",
    "read_skill",
    "write_skill",
    "talk_skill",
    "listen_skill",
  ],
};

const support_request = {
  $id: "support",
  properties: {},
  required: [],
};

const request_validator = new Ajv({
  schemas: [
    children_request,
    contact_request,
    information_request,
    language_request,
    support_request,
  ],
});

export const getChildren = async (
  { cookies, response }: RouterContext,
) => {
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");
  response.body = await children_model.findAll(id);
};

export const getChildrenTable = async (
  { cookies, response }: RouterContext,
) => {
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");
  response.body = await children_model.getTable(id);
};

export const createChildren = async (
  { cookies, request, response }: RouterContext,
) => {
  const { id: person } = await decodeToken(cookies.get("PA_AUTH") || "");
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;
  if (
    !request_validator.validate("children", value)
  ) {
    throw new RequestSyntaxError();
  }

  response.body = await children_model.create(
    person,
    value.gender,
    value.name,
    value.born_date,
  );
};

export const updateChildren = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  const { id: person } = await decodeToken(cookies.get("PA_AUTH") || "");
  if (!id || !request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;
  if (
    !request_validator.validate("children", value)
  ) {
    throw new RequestSyntaxError();
  }

  const children = await children_model.findById(person, id);
  if (!children) throw new NotFoundError();

  response.body = await children.update(
    value.gender,
    value.name,
    value.born_date,
  );
};

export const deleteChildren = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  const { id: person } = await decodeToken(cookies.get("PA_AUTH") || "");
  if (!id) throw new RequestSyntaxError();

  const children = await children_model.findById(person, id);
  if (!children) throw new NotFoundError();

  await children.delete();

  response.body = Message.OK;
};

export const getContacts = async (
  { cookies, response }: RouterContext,
) => {
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");
  response.body = await contact_model.findAll(id);
};

export const getContactsTable = async (
  { cookies, response }: RouterContext,
) => {
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");
  response.body = await contact_model.getTable(id);
};

export const createContact = async (
  { cookies, request, response }: RouterContext,
) => {
  const { id: person } = await decodeToken(cookies.get("PA_AUTH") || "");
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;
  if (
    !request_validator.validate("contact", value)
  ) {
    throw new RequestSyntaxError();
  }

  response.body = await contact_model.create(
    person,
    value.name,
    value.employee_relationship,
    value.cellphone,
  );
};

export const updateContact = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  const { id: person } = await decodeToken(cookies.get("PA_AUTH") || "");
  if (!id || !request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;
  if (
    !request_validator.validate("contact", value)
  ) {
    throw new RequestSyntaxError();
  }

  const children = await contact_model.findById(person, id);
  if (!children) throw new NotFoundError();

  response.body = await children.update(
    value.name,
    value.employee_relationship,
    value.cellphone,
  );
};

export const deleteContact = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  const { id: person } = await decodeToken(cookies.get("PA_AUTH") || "");
  if (!id) throw new RequestSyntaxError();

  const children = await contact_model.findById(person, id);
  if (!children) throw new NotFoundError();

  await children.delete();

  response.body = Message.OK;
};

export const getUserInformation = async (
  { cookies, response }: RouterContext,
) => {
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");
  const user = await findReviewById(id);
  if (!user) throw new NotFoundError();

  response.body = user;
};

export const updateUserInformation = async (
  { cookies, request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");

  const value: {
    document_expedition_date?: string | null;
    document_expedition_city?: number | null;
    birth_date?: string | null;
    birth_city?: number | null;
    military_passbook?: number | null;
    gender?: number | null;
    civil_status: number | null;
    personal_email?: string | null;
    phone?: number | null;
    blood_type?: TipoSangre | null;
    residence_city?: number | null;
    residence_address?: string | null;
    professional_card_expedition?: string | null;
  } = await request.body({ type: "json" }).value;
  if (
    !request_validator.validate("information", value)
  ) {
    throw new RequestSyntaxError();
  }

  let user = await findReviewById(id);
  if (!user) throw new NotFoundError();

  await user.update({
    fec_expedicion_identificacion: value.document_expedition_date,
    fk_ciudad_expedicion_identificacion: value.document_expedition_city,
    fec_nacimiento: value.birth_date,
    fk_ciudad_nacimiento: value.birth_city,
    libreta_militar: value.military_passbook,
    fk_genero: value.gender,
    fk_estado_civil: value.civil_status,
    correo_personal: value.personal_email,
    telefono_fijo: value.phone,
    tipo_sangre: value.blood_type,
    fk_ciudad_residencia: value.residence_city,
    direccion_residencia: value.residence_address,
  });

  // TODO
  // Refactor this, obviously
  if (
    value.birth_date !== undefined ||
    value.birth_city !== undefined ||
    value.military_passbook !== undefined ||
    value.gender !== undefined ||
    value.civil_status !== undefined ||
    value.personal_email !== undefined ||
    value.phone !== undefined ||
    value.blood_type !== undefined ||
    value.professional_card_expedition !== undefined
  ) {
    await requestPersonalDataReview(String(user.pk_persona));
  }

  if (
    value.document_expedition_date !== undefined ||
    value.document_expedition_city !== undefined
  ) {
    await requestIdentificationReview(String(user.pk_persona));
  }

  if (
    value.residence_city !== undefined ||
    value.residence_address !== undefined
  ) {
    await requestResidenceReview(String(user.pk_persona));
  }

  response.body = user;
};

export const getLanguageExperience = async (
  { cookies, response }: RouterContext,
) => {
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");
  response.body = await language_model.findAll(id);
};

export const getLanguageExperienceTable = async (
  { cookies, response }: RouterContext,
) => {
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");
  response.body = await language_model.getTable(id);
};

export const createLanguageExperience = async (
  { cookies, request, response }: RouterContext,
) => {
  const { id: person } = await decodeToken(cookies.get("PA_AUTH") || "");
  if (!request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;
  if (
    !request_validator.validate("language", value)
  ) {
    throw new RequestSyntaxError();
  }

  response.body = await language_model.create(
    person,
    value.language,
    value.read_skill,
    value.write_skill,
    value.talk_skill,
    value.listen_skill,
  );
};

export const updateLanguageExperience = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  const { id: person } = await decodeToken(cookies.get("PA_AUTH") || "");
  if (!id || !request.hasBody) throw new RequestSyntaxError();

  const value = await request.body({ type: "json" }).value;
  if (
    !request_validator.validate("language", value)
  ) {
    throw new RequestSyntaxError();
  }

  const language_experience = await language_model.findById(person, id);
  if (!language_experience) throw new NotFoundError();

  response.body = await language_experience.update(
    value.language,
    value.read_skill,
    value.write_skill,
    value.talk_skill,
    value.listen_skill,
  );
};

export const deleteLanguageExperience = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) throw new RequestSyntaxError();
  const { id: person } = await decodeToken(cookies.get("PA_AUTH") || "");

  const language_experience = await language_model.findById(person, id);
  if (!language_experience) throw new NotFoundError();

  await language_experience.delete();

  response.body = Message.OK;
};

export const getSupportFiles = async (context: RouterContext) => {
  const { id: user_id } = await decodeToken(
    context.cookies.get("PA_AUTH") || "",
  );

  const support_file_format = await getFileFormatCode();

  return tableRequestHandler(
    context,
    file_model.generateFileReviewTable(user_id, support_file_format),
  );
};

export const getSupportFile = async (
  { cookies, params, response }: RouterContext<{ id: string }>,
) => {
  const template_id = Number(params.id);
  if (!template_id) throw new RequestSyntaxError();
  const { id: user_id } = await decodeToken(cookies.get("PA_AUTH") || "");

  const file = await getTemplateFile(
    template_id as number,
    user_id,
  )
    .catch((e) => {
      if (e.name === "NotFound") {
        //404
        throw new NotFoundError();
      } else {
        //500
        throw new Error();
      }
    });

  response.headers.append("Content-Type", file.type);
  response.headers.append(
    "Content-disposition",
    `attachment;filename=${file.name}`,
  );
  response.headers.append("Content-Length", String(file.content.length));

  response.body = file.content;
};

export const uploadSupportFile = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const template_id = Number(params.id);
  if (!template_id) throw new RequestSyntaxError();
  const { id: user_id } = await decodeToken(cookies.get("PA_AUTH") || "");

  const form = await request.body({ type: "form-data" }).value.read({
    maxSize: 10000000,
  });
  if (!form.files || !form.files.length) {
    throw new RequestSyntaxError();
  }

  const {
    content,
    originalName,
  } = form.files[0];
  if (!content) {
    throw new RequestSyntaxError("Tamaño maximo de archivo excedido");
  }

  //TODO
  //VALIDATE EXTENSION
  //VALIDATE SIZE

  const file = await writeTemplateFile(
    template_id,
    user_id,
    content,
    originalName,
  );

  await requestDocumentsReview(`${user_id}_${template_id}`);

  response.body = file;
};

export const getPicture = async (
  { cookies, response }: RouterContext,
) => {
  const { id: user } = await decodeToken(cookies.get("PA_AUTH") || "");

  //TODO
  //The parameter code should be a constant
  const picture_parameter = await findParameter("PLANTILLA_FOTO_PERFIL");
  if (!picture_parameter) throw new NotFoundError();

  const picture_parameter_value = await findParameterValue(
    picture_parameter.pk_parametro,
  );
  if (!picture_parameter_value) throw new NotFoundError();

  const file = await getTemplateFile(
    picture_parameter_value.valor as number,
    user,
  )
    .catch((e) => {
      if (e.name === "NotFound") {
        //404
        throw new NotFoundError();
      } else {
        //500
        throw new Error();
      }
    });

  response.headers.append("Content-Type", file.type);
  response.headers.append(
    "Content-disposition",
    `attachment;filename=${file.name}`,
  );
  response.headers.append("Content-Length", String(file.content.length));

  response.body = file.content;
};

export const updatePicture = async (
  { cookies, request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();
  const { id: user_id } = await decodeToken(cookies.get("PA_AUTH") || "");

  //TODO
  //The parameter code should be a constant
  const picture_parameter = await findParameter("PLANTILLA_FOTO_PERFIL");
  if (!picture_parameter) throw new NotFoundError();

  const picture_parameter_value = await findParameterValue(
    picture_parameter.pk_parametro,
  );
  if (!picture_parameter_value) throw new NotFoundError();

  const form = await request.body({ type: "form-data" }).value.read({
    maxSize: 10000000,
  });
  if (!form.files || !form.files.length) {
    throw new RequestSyntaxError();
  }

  const {
    content,
    originalName,
  } = form.files[0];
  if (!content) {
    throw new RequestSyntaxError("Tamaño maximo de archivo excedido");
  }

  //TODO
  //VALIDATE EXTENSION
  //VALIDATE SIZE

  response.body = await writeTemplateFile(
    Number(picture_parameter_value.valor),
    user_id,
    content,
    originalName,
  );
};

export const getPlanning = async ({ cookies, response }: RouterContext) => {
  const { id: user_id } = await decodeToken(cookies.get("PA_AUTH") || "");

  response.body = await getDetailHeatmapData(
    user_id,
  );
};
