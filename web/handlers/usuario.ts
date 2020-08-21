import { RouterContext } from "oak";
import Ajv from "ajv";
import { decodeToken } from "../../lib/jwt.ts";
import { NotFoundError, RequestSyntaxError } from "../exceptions.ts";
import {
  CELLPHONE,
  STANDARD_DATE_STRING,
  TRUTHY_INTEGER,
} from "../../lib/ajv/types.js";
import { Message } from "../http_utils.ts";
import * as children_model from "../../api/models/users/children.ts";
import * as contact_model from "../../api/models/users/contact.ts";
import * as language_model from "../../api/models/users/language_experience.ts";
import {
  findById as findPerson,
  TipoSangre,
} from "../../api/models/ORGANIZACION/people.ts";

const children_request = {
  $id: "children",
  properties: {
    "gender": TRUTHY_INTEGER,
    "name": {
      maxLength: 255,
      type: "string",
    },
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
    "employee_relationship": {
      pattern: `^(${
        Object
          .values(contact_model.Relationships)
          .map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|")
      })$`,
      type: "string",
    },
    "name": {
      maxLength: 255,
      type: "string",
    },
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
    "birth_date": STANDARD_DATE_STRING,
    "birth_city": TRUTHY_INTEGER,
    "blood_type": {
      pattern: `^(${
        Object
          .values(TipoSangre)
          .map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
          .join("|")
      })$`,
      type: "string",
    },
    "document_expedition_date": STANDARD_DATE_STRING,
    "document_expedition_city": TRUTHY_INTEGER,
    "gender": TRUTHY_INTEGER,
    "marital_status": TRUTHY_INTEGER,
    "military_passbook": TRUTHY_INTEGER,
    "personal_email": {
      maxLength: 320,
      type: "string",
    },
    "phone": TRUTHY_INTEGER,
    "residence_address": {
      maxLength: 95,
      type: "string",
    },
    "residence_city": TRUTHY_INTEGER,
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

//@ts-ignore
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
  const user = await findPerson(id);
  if (!user) throw new NotFoundError();

  response.body = user;
};

export const updateUserInformation = async (
  { cookies, request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");
  const user = await findPerson(id);
  if (!user) throw new NotFoundError();

  const value = await request.body({ type: "json" }).value;
  if (
    !request_validator.validate("information", value)
  ) {
    throw new RequestSyntaxError();
  }

  response.body = await user.update(
    undefined,
    undefined,
    value.document_expedition_date,
    value.document_expedition_city,
    undefined,
    undefined,
    value.birth_date,
    value.birth_city,
    value.military_passbook,
    value.gender,
    value.civil_status,
    value.personal_email,
    value.phone,
    value.blood_type,
    value.residence_city,
    value.residence_address,
  );
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
  const { id: person } = await decodeToken(cookies.get("PA_AUTH") || "");
  if (!id) throw new RequestSyntaxError();

  const language_experience = await language_model.findById(person, id);
  if (!language_experience) throw new NotFoundError();

  await language_experience.delete();

  response.body = Message.OK;
};

export const getResidence = async ({ cookies }: RouterContext) => {
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");
  console.log(id);
};

export const updateResidence = () => {};

export const getSupportFiles = async ({ cookies }: RouterContext) => {
  const { id } = await decodeToken(cookies.get("PA_AUTH") || "");
  console.log(id);
};

export const updateSupportFiles = () => {};
