import { Hono } from "hono";
import auth from "./auth";
import system from "./system";
import _process from "./process";
import { authMiddleware } from "../lib/jwt";

const routes = new Hono()
  .route("/auth", auth)
  .use(authMiddleware)
  .route("/system", system)
  .route("/process", _process);

export type AppType = typeof routes;

export default routes;
