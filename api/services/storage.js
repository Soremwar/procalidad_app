import * as config from "../../config/services/storage.js";
import {
  ensureDirSync,
  ensureFileSync,
} from "fs";
import {
  extname,
  resolve,
} from "path";
import {
  contentType,
} from "media_types";

const resolveUploadFolder = () => {
  try {
    ensureDirSync(config.upload_folder);
    return resolve(
      Deno.cwd(),
      config.upload_folder,
    );
  } catch (e) {
    throw new Error("El directorio de carga de archivos no pudo ser creado");
  }
};

export const deleteUploadFile = async (
  file_relative_path,
) => {
  const storage_path = resolveUploadFolder();
  const file_path = resolve(
    storage_path,
    file_relative_path,
  );
  await Deno.remove(file_path);
};

export const getUploadFile = async (
  file_relative_path,
) => {
  const storage_path = resolveUploadFolder();
  const file_path = resolve(
    storage_path,
    file_relative_path,
  );
  const file_content = Deno.readFileSync(file_path);

  return {
    content: file_content,
    type: contentType(extname(file_path)) || "text/plain",
  };
};

export const writeUploadFile = async (
  file_relative_path,
  content,
) => {
  const storage_path = resolveUploadFolder();
  const file_path = resolve(
    storage_path,
    file_relative_path,
  );
  ensureFileSync(file_path);

  const file = await Deno.open(file_path, {
    write: true,
  });
  await Deno.writeAll(file, content);
  Deno.close(file.rid);
};
