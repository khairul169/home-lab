import { Hono } from "hono";
import auth from "./auth";
import system from "./system";
import _process from "./process";
import apps from "./apps";
import { authMiddleware } from "../lib/jwt";

const routes = new Hono()
  .route("/auth", auth)
  .use(authMiddleware)
  .route("/system", system)
  .route("/process", _process)
  .route("/apps", apps);

export type AppType = typeof routes;

export default routes;
