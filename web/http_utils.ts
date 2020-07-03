import { Response, Status } from "oak";

export enum Message {
  BadRequest = "Los parámetros de la solicitud son inválidos",
  InternalServerError = "Ocurrio un error al procesar la solicitud",
  Forbidden = "No tiene permiso para acceder a este contenido",
  NotFound = "El contenido solicitado no existe",
  OK = "La operación fue completada con éxito",
  Unauthorized = "La solicitud no tiene una sesión válida",
}

export const formatResponse = (
  response: Response,
  status_code: Status,
  message: string | Message,
): Response => {
  response.status = status_code;
  response.body = { message };
  return response;
};

//TODO
//Remove this reexport in favor of Oak's one
export { Status };
