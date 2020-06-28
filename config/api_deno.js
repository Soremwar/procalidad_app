import {
  readJson,
} from "fs";

//TODO
//This all should go away in favor for a cross-platform solution

const config = await readJson("config.json");

const address = config?.api?.address || "127.0.0.1";
const port = Number(config?.api?.port) || 8000;
const prefix = config?.api?.prefix || "api";

export {
  address,
  port,
  prefix,
};
