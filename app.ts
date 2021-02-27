import { Application, httpErrors, send, Status } from "oak";
import { fromFileUrl } from "path";
import { existsSync } from "fs";
import { allowedMethods, routes } from "./web/routes.ts";
import { address, port } from "./config/api_deno.js";
import { errorHandler } from "./web/middleware.ts";
import { State } from "./web/state.ts";

//TODO
//Add a check for database parameters before startup
//Fail and notify on error if active definition doesn't exist either

const app = new Application<State>();

app.use(errorHandler);
app.use(routes);
app.use(allowedMethods);

// If route not found in API router or in public folder
// Default to static file (React App)
app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    hidden: true,
    index: "index.html",
    root: "public",
  })
    .catch(async (e) => {
      if (e instanceof httpErrors.NotFound) {
        const app_fallback = await Deno.readFile(
          new URL("./public/index.html", import.meta.url),
        );
        context.response.body = app_fallback;
        context.response.headers.set("Content-Type", "text/html");
        context.response.status = Status.NotFound;
      } else {
        throw e;
      }
    });
});

let tls = false;
let cert_file = fromFileUrl(new URL("server.crt", import.meta.url));
let key_file = fromFileUrl(new URL("server.key", import.meta.url));
if (existsSync(cert_file) && existsSync(key_file)) {
  tls = true;
}

if (!tls) {
  console.error(
    "No TLS certificates were found\n" +
      'Place your certificate "server.crt" and private key "server.key" on the project root',
  );
}

app.addEventListener("listen", ({ hostname, port }) => {
  console.log(
    `${tls ? "HTTPS" : "HTTP"} server running on ${hostname}:${port}`,
  );
});

if (tls) {
  await app.listen({
    hostname: address,
    port,
  });
} else {
  await app.listen({
    certFile: cert_file,
    hostname: address,
    keyFile: key_file,
    port,
    secure: true,
  });
}
