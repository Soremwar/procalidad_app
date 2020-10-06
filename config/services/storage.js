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

const storage = config?.services?.storage;

const upload_folder = String(storage?.upload_folder) || "storage/uploads";

export { upload_folder };
