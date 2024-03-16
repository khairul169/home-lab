import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { HTTPException } from "hono/http-exception";
import routes from "./routes/_routes";

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

export default app;
