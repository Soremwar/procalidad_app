import { RouterContext, Status } from "oak";
import { Message, formatResponse } from "./http_utils.ts";
import { NotFoundError, RequestSyntaxError } from "./exceptions.ts";

export default async (
  { response }: RouterContext,
  next: () => Promise<void>
) => {
  try {
    await next();
  } catch (error) {
    switch (error.constructor) {
      case RequestSyntaxError:
        response = formatResponse(
          response,
          Status.BadRequest,
          error.message || Message.BadRequest
        );
        break;
      case NotFoundError:
        response = formatResponse(
          response,
          Status.NotFound,
          error.message || Message.NotFound
        );
        break;
      default:
        response = formatResponse(
          response,
          Status.InternalServerError,
          error.message || Message.InternalServerError
        );
    }
  }
};
