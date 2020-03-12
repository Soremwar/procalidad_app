import { Application, send } from "oak";
import { routes, allowedMethods } from "./web/routes.ts";
import config from "./config.json";
import middleware from "./web/middleware.ts";

const app = new Application();

app.use(middleware);
app.use(routes);
app.use(allowedMethods);

app.use(async context => {
  await send(context, context.request.path, {
    root: 'public',
    index: "index.html"
  });
});
// TODO replace with calculations on return view or JSON
app.use(async () => {
  response.status = 404;
  response.body = { message: "Not found" };
});

console.log(`Server running on port ${config.client.port}`);

await app.listen({ port: config.client.port });
