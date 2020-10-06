//TODO
//This all should go away in favor for a cross-platform solution
import { NotFoundError } from "../web/exceptions.ts";

const config = await Deno.readTextFile(
  new URL(
    "../config.json",
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

const address = config?.app?.address || "127.0.0.1";
const port = Number(config?.app?.port) || "80";
const protocol = config?.app?.protocol || "http";
const version = config?.app?.version || "NA";

export { address, port, protocol, version };
