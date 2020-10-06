import { Client } from "deno_postgres";
import {
  database,
  host,
  password,
  port,
  user,
} from "../../config/services/postgresql.ts";

async function create_new_client() {
  const client = new Client({
    database,
    hostname: host,
    password,
    user,
    port,
  });
  await client.connect().catch((e) => {
    const current_parameters = JSON.stringify(client._connection.connParams);
    throw new Error(
      `Connection refused with provided arguments: ${current_parameters}\nError: ${e.message}`,
    );
  });
  return client;
}

export default await create_new_client();
