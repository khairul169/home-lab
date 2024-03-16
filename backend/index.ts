import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import fs from "node:fs";
import { HTTPException } from "hono/http-exception";
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import routes from "./routes/_routes";
import createWsServer from "./websocket";

const PUBLIC_DIR = "./public";

const app = new Hono()
  .use(cors())
  .route("/api", routes)
  .use("*", serveStatic({ root: PUBLIC_DIR }), async (c) => {
    const index = fs.readFileSync(PUBLIC_DIR + "/index.html", "utf8");
    c.header("Content-Type", "text/html");
    return c.html(index);
  })
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
