//TODO
//This all should go away in favor for a cross-platform solution
import { NotFoundError } from "../web/exceptions.ts";
import { fromFileUrl } from "path";
import { existsSync } from "fs";

const config = await Deno.readTextFile(
  new URL(
    "../api_config.json",
    import.meta.url,
  ),
)
  .then((x) => JSON.parse(x))
  .catch((e) => {
    if (e.name === "NotFound") {
      throw new NotFoundError("El archivo de configuración no fue encontrado");
    } else {
      throw new Error(
        "Ocurrio un error al analizar el archivo de configuración",
      );
    }
  });

let secure = false;
let cert_file = fromFileUrl(new URL("../server.crt", import.meta.url));
let key_file = fromFileUrl(new URL("../server.key", import.meta.url));
if (existsSync(cert_file) && existsSync(key_file)) {
  secure = true;
}

export const address = config?.address || "127.0.0.1";
export const encryption_key = config?.encryption_key || "secret-key";
export const port = Number(config?.port) || 8000;
export const prefix = config?.prefix || "api";
export const tls = {
  cert_file,
  key_file,
  secure,
};
