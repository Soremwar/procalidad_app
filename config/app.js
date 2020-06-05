import config from "../config.json";

const address = config?.app?.address || window.location.hostname;
const port = Number(config?.app?.port) || window.location.port;
const protocol = config?.app?.protocol || "http";
const version = config?.app?.version || "NA";

//TODO
//Move default password to backend
const dev_username = config?.app?.username || "admin";
const dev_password = config?.app?.password || "admin";

export {
  address,
  dev_username as username,
  dev_password as password,
  port,
  protocol,
  version,
};
