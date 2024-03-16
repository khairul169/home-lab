import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import routes from "./routes/_routes";
import createWsServer from "./websocket";

const app = new Hono()
  .use(cors())
  .use("*", serveStatic({ root: "./public" }))
  .route("/", routes)
  .onError((err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    return c.json({ message: err.message }, 500);
  });

const server = serve(
  { fetch: app.fetch, port: parseInt(process.env.PORT || "") || 3000 },
  (info) => {
    console.log(`App listening on http://${info.address}:${info.port}`);
  }
);

createWsServer(server);
