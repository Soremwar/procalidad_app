import {
  RouterContext,
} from "oak";
import Ajv from "ajv";
import {
  createNewToken,
} from "../../lib/jwt.ts";
import {
  findByEmail,
} from "../../api/models/MAESTRO/access.ts";
import {
  findById,
} from "../../api/models/ORGANIZACION/people.ts";
import {
  AuthenticationRejectedError,
  NotFoundError,
  RequestSyntaxError,
} from "../exceptions.ts";

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
  const value = await request.body({ type: "json" }).value;

  if (!request_validator.validate("auth", value)) {
    throw new RequestSyntaxError();
  }

  const access = await findByEmail(value.email);
  if (!access) throw new AuthenticationRejectedError();

  const person = await findById(access.person);
  if (!person) throw new NotFoundError();

  const user_data = {
    id: access.person,
    name: person.nombre,
    email: person.correo,
    profiles: access.profiles,
  };

  const session_key = await createNewToken(
    user_data,
  );

  cookies.set("PA_AUTH", session_key, {
    httpOnly: false,
  });

  response.body = user_data;
};
