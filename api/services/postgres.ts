import { Pool } from "deno_postgres";
import { QueryObjectConfig } from "deno_postgres/query/query.ts";
import {
  database,
  host,
  password,
  port,
  user,
} from "../../config/services/postgresql.ts";

const pool = new Pool({
  database,
  hostname: host,
  password,
  user,
  port,
}, 20);

// deno-lint-ignore no-explicit-any
export async function queryArray<T extends unknown[] = any>(
  query: string,
  ...params: unknown[]
) {
  const client = await pool.connect();
  const result = await client.queryArray<T>(query, ...params);
  await client.release();
  return result;
}

export async function queryObject<T extends Record<string, unknown>>(
  config: QueryObjectConfig,
) {
  const client = await pool.connect();
  const result = await client.queryObject<T>(config);
  await client.release();
  return result;
}

// TODO
// This is legacy
export default {
  query: queryArray,
};
