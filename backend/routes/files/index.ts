import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getFilesSchema, ytdlSchema } from "./schema";
import { getFiles } from "./get";
import { download } from "./download";
import { getYtdl, ytdl } from "./ytdl";
import cache from "../../middlewares/cache";
import { getId3Tags, getId3Image } from "./id3Tags";
import { deleteFile } from "./delete";

const cacheFile = cache({ ttl: 86400 });

const route = new Hono()
  .get("/", zValidator("query", getFilesSchema), getFiles)
  .post("/upload")
  .post("/ytdl", zValidator("json", ytdlSchema), ytdl)
  .get("/ytdl/:id", getYtdl)
  .get("/download/*", cacheFile, download)
  .get("/id3-tags/*", cacheFile, getId3Tags)
  .get("/id3-img/*", cacheFile, getId3Image)
  .delete("/delete", deleteFile);

export default route;
