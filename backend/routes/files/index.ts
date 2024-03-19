import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getFilesSchema, ytdlSchema } from "./schema";
import { getFiles } from "./get";
import { download } from "./download";
import { getYtdl, ytdl } from "./ytdl";

const route = new Hono()
  .get("/", zValidator("query", getFilesSchema), getFiles)
  .post("/upload")
  .post("/ytdl", zValidator("json", ytdlSchema), ytdl)
  .get("/ytdl/:id", getYtdl)
  .get("/download/*", download);

export default route;
