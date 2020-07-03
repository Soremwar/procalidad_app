export class RequestSyntaxError extends Error {
  constructor(message?: string) {
    super(message);
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
