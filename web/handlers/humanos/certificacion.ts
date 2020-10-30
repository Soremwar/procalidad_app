import type { RouterContext } from "oak";
import Ajv from "ajv";
import * as certification_model from "../../../api/models/users/certification.ts";
import { tableRequestHandler } from "../../../api/common/table.ts";
import { NotFoundError, RequestSyntaxError } from "../../exceptions.ts";
import { setReview } from "../../../api/reviews/user_certification.ts";
import { castStringToBoolean } from "../../../lib/utils/boolean.js";
import { BOOLEAN, STRING_OR_NULL } from "../../../lib/ajv/types.js";
import { decodeToken } from "../../../lib/jwt.ts";
import { Message } from "../../http_utils.ts";

const review_request = {
  $id: "review",
  properties: {
    "approved": BOOLEAN,
    "observations": STRING_OR_NULL({
      min: 0,
      max: 255,
    }),
  },
};

const request_validator = new Ajv({
  schemas: [
    review_request,
  ],
});

export const getCertification = async (
  { params, response }: RouterContext<{ id: string }>,
) => {
  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const laboral_experience = await certification_model.findById(
    id,
  );
  if (!laboral_experience) throw new NotFoundError();

  response.body = laboral_experience;
};

export const getCertificationTable = async (
  context: RouterContext,
) =>
  tableRequestHandler(
    context,
    certification_model.generateTableData(),
  );

export const updateCertificationReview = async (
  { cookies, params, request, response }: RouterContext<{ id: string }>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const value = await request.body({ type: "json" }).value;
  if (!request_validator.validate("review", value)) {
    throw new RequestSyntaxError();
  }

  await setReview(
    id,
    user_id,
    castStringToBoolean(value.approved),
    value.observations || "",
  );

  response.body = Message.OK;
};
