import {
  readJson,
} from "fs";

//TODO
//This all should go away in favor for a cross-platform solution

const config = await readJson("config.json");

const address = config?.app?.address || window.location.hostname;
const port = Number(config?.app?.port) || window.location.port;
const protocol = config?.app?.protocol || "http";
const version = config?.app?.version || "NA";

export {
  address,
  port,
  protocol,
  version,
};