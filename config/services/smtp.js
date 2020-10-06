import { NotFoundError } from "../../web/exceptions.ts";

const config = await Deno.readTextFile(
  new URL(
    "../../config.json",
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

const smtp = config?.services?.smtp;

const host = String(smtp?.host) || "";
const password = String(smtp?.password) || "";
const port = Number(smtp?.port) || 1000;
const username = String(smtp?.username) || "";

export { host, password, port, username };
