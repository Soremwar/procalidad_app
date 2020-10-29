import type { RouterContext } from "oak";
import Ajv from "ajv";
import { RequestSyntaxError } from "../../exceptions.ts";
import { setReview as setIdentificationReview } from "../../../api/reviews/user_identification.ts";
import { setReview as setPersonalDataReview } from "../../../api/reviews/user_personal_data.ts";
import { setReview as setResidenceReview } from "../../../api/reviews/user_residence.ts";
import { castStringToBoolean } from "../../../lib/utils/boolean.js";
import { BOOLEAN, STRING_OR_NULL } from "../../../lib/ajv/types.js";
import { decodeToken } from "../../../lib/jwt.ts";
import { Message } from "../../http_utils.ts";

enum PersonDataType {
  documentos = "documentos",
  personal = "personal",
  residencia = "residencia",
}

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

export const updatePersonReview = async (
  { cookies, params, request, response }: RouterContext<
    { tipo: string; id: string }
  >,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  const { id: user_id } = await decodeToken(session_cookie);

  if (!(params.tipo in PersonDataType)) {
    throw new RequestSyntaxError();
  }

  const id = Number(params.id);
  if (!id) {
    throw new RequestSyntaxError();
  }

  const value = await request.body({ type: "json" }).value;
  if (!request_validator.validate("review", value)) {
    throw new RequestSyntaxError();
  }

  let setReview;
  switch (params.tipo) {
    case PersonDataType.documentos:
      setReview = setIdentificationReview;
      break;
    case PersonDataType.personal:
      setReview = setPersonalDataReview;
      break;
    case PersonDataType.residencia:
      setReview = setResidenceReview;
      break;
    default:
      throw new Error();
  }

  await setReview(
    id,
    user_id,
    castStringToBoolean(value.approved),
    value.observations || "",
  );

  response.body = Message.OK;
};
