import {
  readJson,
} from "fs";

const config = await readJson("config.json");

const storage = config?.services?.storage;

const upload_folder = String(storage?.upload_folder) || "storage/uploads";

export {
  upload_folder,
};
