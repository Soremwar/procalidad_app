import {
  readJson,
} from "fs";

const config = await readJson("config.json");

const smtp = config?.services?.smtp;

const host = String(smtp?.host) || "";
const password = String(smtp?.password) || "";
const port = Number(smtp?.port) || 1000;
const username = String(smtp?.username) || "";

export {
  host,
  password,
  port,
  username,
};
