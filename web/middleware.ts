import { composeMiddleware, Context, Status } from "oak";
import { decodeToken } from "../lib/jwt.ts";
import Ajv from "ajv";
import { TRUTHY_INTEGER } from "../lib/ajv/types.js";
import { formatResponse, Message } from "./http_utils.ts";
import {
  AuthenticationRejectedError,
  ForbiddenAccessError,
  NotFoundError,
  RequestSyntaxError,
} from "./exceptions.ts";
import type { Profiles } from "../api/common/profiles.ts";
import { State } from "./state.ts";

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

export const checkUserAccess = (required_profiles?: Profiles[]) => {
  return composeMiddleware([
    initializeUserSession,
    async (
      { state }: Context,
      next: () => Promise<void>,
    ) => {
      if (required_profiles) {
        const user_profiles: number[] = state.user.profiles;

        const has_required_profiles = user_profiles.some((profile) =>
          required_profiles.includes(profile)
        );
        if (!has_required_profiles) {
          throw new ForbiddenAccessError("No tiene acceso a este contenido");
        }
      }

      await next();
    },
  ]);
};

//TODO
//Refactor this.
// Should receive an error with code and return object with error and message
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
          error.code,
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

/**
 * This decodes user cookie session and appends it to the app state
 */
const initializeUserSession = async (
  { cookies, state }: Context,
  next: () => Promise<void>,
) => {
  const session_cookie = cookies.get("PA_AUTH") || "";
  let session;
  try {
    session = await decodeToken(session_cookie);
  } catch (_e) {
    throw new AuthenticationRejectedError();
  }

  if (!token_validator.validate(token_structure, session)) {
    throw new RequestSyntaxError(
      "La estructura de la sesion no es la esperada",
    );
  }

  state.user = session;

  await next();
};
