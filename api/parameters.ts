import { findByCode as findParameter } from "./models/MAESTRO/parametro.ts";
import { NotFoundError } from "../web/exceptions.ts";

export const getFileFormatCode = async () => {
  const format_parameter = await findParameter("FORMATO_SOPORTES");
  if (!format_parameter) throw new NotFoundError();

  const value = await format_parameter.getValue();
  if (!Number(value)) {
    throw new Error("Los parametros para cargar soportes no estan definidos");
  }

  return Number(value);
};
