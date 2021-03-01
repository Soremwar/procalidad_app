import config from "../app_config.json";

const address: string = config?.address || window.location.hostname;
const authentication: {
  client_id: string;
} = {
  client_id: config?.authentication?.client_id || "",
};
const api: {
  prefix: string;
} = {
  prefix: config?.api?.prefix || "api",
};
const port = Number(config?.port) || window.location.port;
const protocol: string = config?.protocol ||
  window.location.protocol.substr(0, window.location.protocol.length - 1);
const version: string = config?.version || "NA";

export { address, api, authentication, port, protocol, version };
