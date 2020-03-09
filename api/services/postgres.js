import { Client } from "deno_postgres";
import config_file from "../../config.json";

const postgres_config = config_file?.services?.postgresql;

async function create_new_client() {
  const client = new Client(postgres_config);
  await client.connect().catch(e => {
    const current_parameters = JSON.stringify(client._connection.connParams);
    throw new Error(
      `Connection refused with provided arguments: ${current_parameters}\nError: ${e.message}`
    );
  });
  return client;
}

export default await create_new_client();
