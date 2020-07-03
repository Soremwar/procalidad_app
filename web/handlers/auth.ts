import {
  Body,
  RouterContext,
} from "oak";
import Ajv from "ajv";
import { makeJwt, setExpiration, Jose, Payload } from "djwt/create.ts";
import {
  encryption_key,
} from "../../config/api_deno.js";
import {
  findByEmail,
} from "../../api/models/MAESTRO/access.ts";
import {
  AuthenticationRejectedError,
  RequestSyntaxError,
} from "../exceptions.ts";

const jwt_header: Jose = {
  alg: "HS256",
  typ: "JWT",
};

const request_structure = {
  $id: "auth",
  required: [
    "email",
  ],
  properties: {
    "email": {
      type: "string",
    },
  },
};

// @ts-ignore
const request_validator = new Ajv({
  schemas: [
    request_structure,
  ],
});

export const createSession = async (
  { cookies, request, response }: RouterContext,
) => {
  if (!request.hasBody) throw new RequestSyntaxError();
  const {
    type,
    value,
  }: Body = await request.body();

  if (
    type !== "json" || !request_validator.validate("auth", value)
  ) {
    throw new RequestSyntaxError();
  }

  const access = await findByEmail(value.email);
  if (!access) throw new AuthenticationRejectedError();

  //TODO
  //Change issuer to use config name
  const payload: Payload = {
    context: {
      user: {
        id: access.person,
        profiles: access.profiles,
      },
    },
    exp: setExpiration(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
    iss: "PROCALIDAD_APP",
  };

  const session_key = makeJwt(
    { header: jwt_header, key: encryption_key, payload },
  );

  cookies.set("PA_AUTH", session_key, {
    httpOnly: false,
  });

  response.body = {
    profiles: access.profiles,
  };
};
