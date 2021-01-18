import { Application, send } from "oak";
import { allowedMethods, routes } from "./web/routes.ts";
import { address, port } from "./config/api_deno.js";
import { errorHandler, initializeUserSession } from "./web/middleware.ts";
import { State } from "./web/state.ts";

//TODO
//Add a check for database parameters before startup
//Fail and notify on error if active definition doesn't exist either

const app = new Application<State>();

app.use(initializeUserSession);
app.use(errorHandler);
app.use(routes);
app.use(allowedMethods);

//If route not found in API router
//Default to static file (React App)
app.use(async (context) => {
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
