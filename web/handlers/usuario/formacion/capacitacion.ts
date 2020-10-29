import type { RouterContext } from "oak";
import Ajv from "ajv";
import { FormationType } from "../../../../api/models/users/formation_level.ts";
import * as formation_title_model from "../../../../api/models/users/formation_title.ts";
import { NotFoundError, RequestSyntaxError } from "../../../exceptions.ts";
import { tableRequestHandler } from "../../../../api/common/table.ts";
import { requestReview } from "../../../../api/reviews/user_formation.ts";
import { decodeToken } from "../../../../lib/jwt.ts";
import {
  STANDARD_DATE_STRING,
  STANDARD_DATE_STRING_OR_NULL,
  TRUTHY_INTEGER,
  TRUTHY_INTEGER_OR_NULL,
} from "../../../../lib/ajv/types.js";
export {
  deleteTitle as deleteTrainingTitle,
  getTitle as getTrainingTitle,
} from "./formacion.ts";

const update_request = {
  $id: "update",
  properties: {
    "end_date": STANDARD_DATE_STRING_OR_NULL,
    "formation_level": TRUTHY_INTEGER,
    "start_date": STANDARD_DATE_STRING,
    "teacher": TRUTHY_INTEGER_OR_NULL,
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
    "start_date",
    "teacher",
    "title",
  ],
});

const request_validator = new Ajv({
  schemas: [
    create_request,
    update_request,
  ],
});

export const createTrainingTitle = async (
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

  const formation_title = await formation_title_model.create(
    value.formation_level,
    user_id,
    value.title,
    null,
    value.start_date,
    value.end_date,
    null,
    value.teacher,
    null,
  );

  await requestReview(formation_title.id);

  response.body = formation_title;
};

export const getTrainingTitles = async (
  { cookies, response }: RouterContext,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  response.body = await formation_title_model.getAll(
    FormationType.Capacitaciones,
    user_id,
  );
};

export const getTrainingTitlesTable = async (
  context: RouterContext,
) => {
  const session_cookie = context.cookies.get("PA_AUTH") || "";
  const { id } = await decodeToken(session_cookie);

  return tableRequestHandler(
    context,
    formation_title_model.generateTableData(
      FormationType.Capacitaciones,
      id,
    ),
  );
};

export const updateTrainingTitle = async (
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

  const training_title = await formation_title_model.findByIdAndUser(
    id,
    user_id,
  );
  if (!training_title) {
    throw new NotFoundError();
  }

  await training_title.update(
    null,
    value.start_date,
    value.end_date,
    null,
    undefined,
    value.teacher,
  )
    .catch(() => {
      throw new Error("No fue posible actualizar el título de formación");
    });

  await requestReview(training_title.id);

  response.body = training_title;
};
