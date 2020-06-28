import { Application, send } from "oak";
import { routes, allowedMethods } from "./web/routes.ts";
import { address, port } from "./config/api_deno.js";
import middleware from "./web/middleware.ts";

const app = new Application();

app.use(middleware);
app.use(routes);
app.use(allowedMethods);

app.use(async (context) => {
  //Send to the app or serve static file
  let resource;
  switch (context.request.url.pathname.split("/")[1]) {
    case "resources":
      resource = context.request.url.pathname;
      break;
    default:
      resource = "index.html";
  }

  await send(context, resource, {
    root: "public",
  });
});

console.log(`Server running on ${address}:${port}`);

await app.listen({ hostname: address, port });
