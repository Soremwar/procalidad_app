import config from "./config.json";
import App from "./components/App.jsx";
import { serve } from "deno_http/server.ts";

const s = serve({ port: config.client.port });
console.log(`Server running on port ${config.client.port}`);

for await (const req of s) {
  req.respond({ body: App });
}
