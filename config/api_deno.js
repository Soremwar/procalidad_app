import {
  readJson,
} from "fs";

//TODO
//This all should go away in favor for a cross-platform solution

const config = await readJson("config.json");

export const address = config?.api?.address || "127.0.0.1";
export const encryption_key = config?.api?.encryption_key || "secret-key";
export const port = Number(config?.api?.port) || 8000;
export const prefix = config?.api?.prefix || "api";
