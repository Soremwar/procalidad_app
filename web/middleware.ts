import { Context, Status } from "oak";
import { decodeToken } from "../lib/jwt.ts";
import Ajv from "ajv";
import {
  TRUTHY_INTEGER,
} from "../lib/ajv/types.js";
import { formatResponse, Message } from "./http_utils.ts";
import {
  AuthenticationRejectedError,
  ForbiddenAccessError,
  NotFoundError,
  RequestSyntaxError,
} from "./exceptions.ts";
import { Profiles } from "../api/common/profiles.ts";

export const errorHandler = async (
  { response }: Context,
  next: () => Promise<void>,
) => {
  try {
    await next();
  } catch (error) {
    switch (error.constructor) {
      case AuthenticationRejectedError:
        response = formatResponse(
          response,
          Status.Unauthorized,
          error.message || Message.Unauthorized,
        );
        break;
      case ForbiddenAccessError:
        response = formatResponse(
          response,
          Status.Forbidden,
          error.message || Message.Forbidden,
        );
        break;
      case RequestSyntaxError:
        response = formatResponse(
          response,
          Status.BadRequest,
          error.message || Message.BadRequest,
        );
        break;
      case NotFoundError:
        response = formatResponse(
          response,
          Status.NotFound,
          error.message || Message.NotFound,
        );
        break;
      default:
        response = formatResponse(
          response,
          Status.InternalServerError,
          error.message || Message.InternalServerError,
        );
    }
  }
};

//@ts-ignore
const token_validator = new Ajv();
const token_structure = {
  required: [
    "id",
    "name",
    "email",
    "profiles",
  ],
  properties: {
    "id": TRUTHY_INTEGER,
    "name": {
      type: "string",
    },
    "email": {
      type: "string",
    },
    "profiles": {
      items: [
        TRUTHY_INTEGER,
      ],
      type: "array",
    },
  },
};

export const checkProfileAccess = (required_profiles: Profiles[]) => {
  return async (
    { cookies }: Context,
    next: () => Promise<void>,
  ) => {
    const session_cookie = cookies.get("PA_AUTH");
    if (!session_cookie) {
      throw new AuthenticationRejectedError("El usuario no esta autenticado");
    }

    const session_data = await decodeToken(session_cookie);
    if (!token_validator.validate(token_structure, session_data)) {
      throw new RequestSyntaxError(
        "La estructura de la sesion no es la esperada",
      );
    }

    const user_profiles: number[] = session_data.profiles;

    const has_required_profiles = user_profiles.some((profile) =>
      required_profiles.includes(profile)
    );
    if (!has_required_profiles) {
      throw new ForbiddenAccessError("No tiene acceso a este contenido");
    }

    await next();
  };
};
