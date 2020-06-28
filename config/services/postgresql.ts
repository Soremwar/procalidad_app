import {
  readJson,
} from "fs";

const config = await readJson("config.json") as any;

const postgresql = config?.services?.postgresql;

const database: string = postgresql?.database || "";
const host: string = postgresql?.host || "127.0.0.1";
const password: string = postgresql?.password || "";
const port: number = Number(postgresql?.port) || 5432;
const user: string = postgresql?.user || "postgres";

export {
  database,
  host,
  password,
  port,
  user,
};
