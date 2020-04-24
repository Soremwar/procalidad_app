import config from "../config.json";

const address = config?.app?.address || "127.0.0.1";
const port = Number(config?.app?.port) || 8000;
const prefix = config?.api?.prefix || "api";

export {
  address,
  port,
  prefix,
};
