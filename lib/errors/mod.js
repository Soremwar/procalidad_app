const UNEXPECTED_RESPONSE = "El servidor no genero la respuesta esperada";

export const messages = {
  UNEXPECTED_RESPONSE,
};

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = "NetworkError";
  }
}
