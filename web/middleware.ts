import { Context, Status } from "oak";
import { validateJwt } from "djwt/validate.ts";
import { formatResponse, Message } from "./http_utils.ts";
import {
  AuthenticationRejectedError,
  ForbiddenAccessError,
  NotFoundError,
  RequestSyntaxError,
} from "./exceptions.ts";
import { Profiles } from "../api/common/profiles.ts";
import { encryption_key } from "../config/api_deno.js";

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

export const checkProfileAccess = (required_profiles: Profiles[]) => {
  return async (
    { cookies }: Context,
    next: () => Promise<void>,
  ) => {
    const session_cookie = cookies.get("PA_AUTH");
    if (!session_cookie) {
      throw new AuthenticationRejectedError("El usuario no esta autenticado");
    }

    const session_data = await validateJwt(session_cookie, encryption_key);
    if (!session_data.isValid) {
      throw new AuthenticationRejectedError("La sesion es invalida");
    }

    const context = session_data.payload?.context as any;
    const user_profiles: Profiles[] = Array.isArray(context?.user?.profiles)
      ? context?.user?.profiles
      : [];

    const has_required_profiles = user_profiles.some((profile) =>
      required_profiles.includes(profile)
    );
    if (!has_required_profiles) {
      throw new ForbiddenAccessError("No tiene acceso a este contenido");
    }

    await next();
  };
};
