import config from "../app_config.json";

const address = config?.address || window.location.hostname;
const api = {
  prefix: config?.api?.prefix || "api",
};
const port = Number(config?.port) || window.location.port;
const protocol = config?.protocol || "http";
const version = config?.version || "NA";

export { address, api, port, protocol, version };
