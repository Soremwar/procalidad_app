import { Message } from "./http_utils.ts";

export class RequestSyntaxError extends Error {
  public code: string;

  constructor();
  constructor(message: string);
  constructor(code: string, message: string);
  constructor(x?: string, y?: string) {
    const message = y || x || Message.BadRequest;
    const code = y ? x as string : "BAD_REQUEST";

    super(message);
    this.code = code;
  }
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class AuthenticationRejectedError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class ForbiddenAccessError extends Error {
  constructor(message?: string) {
    super(message);
  }
}
