import { NotFoundError } from "../../web/exceptions.ts";

const config: any = await Deno.readTextFile(
  new URL(
    "../../api_config.json",
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

const postgresql = config?.services?.postgresql;

const database: string = postgresql?.database || "";
const encryption_key = postgresql?.encryption_key;
const host: string = postgresql?.host || "127.0.0.1";
const password: string = postgresql?.password || "";
const port: number = Number(postgresql?.port) || 5432;
const user: string = postgresql?.user || "postgres";

if (!encryption_key) {
  throw new Error(
    "La llave de encriptacion para la base de datos no fue definida",
  );
}

export { database, encryption_key, host, password, port, user };
