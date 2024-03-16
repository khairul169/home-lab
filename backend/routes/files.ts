import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import fs from "node:fs/promises";
import { HTTPException } from "hono/http-exception";
import { createReadStream } from "node:fs";
import { getMimeType } from "../lib/utils";

const getFilesSchema = z
  .object({
    path: z.string(),
  })
  .partial()
  .optional();

const filesDirList = process.env.FILE_DIRS
  ? process.env.FILE_DIRS.split(";").map((i) => ({
      name: i.split("/").at(-1),
      path: i,
    }))
  : [];

const route = new Hono()
  .get("/", zValidator("query", getFilesSchema), async (c) => {
    const input: z.infer<typeof getFilesSchema> = c.req.query();
    const pathname = (input.path || "").split("/");
    const path = pathname.slice(2).join("/");
    const baseName = pathname[1];

    if (!baseName?.length) {
      return c.json(
        filesDirList.map((i) => ({
          name: i.name,
          path: "/" + i.name,
          isDirectory: true,
        }))
      );
    }

    const baseDir = filesDirList.find((i) => i.name === baseName)?.path;
    if (!baseDir) {
      return c.json([]);
    }

    try {
      const cwd = baseDir + "/" + path;
      const entities = await fs.readdir(cwd, { withFileTypes: true });

      const files = entities
        .filter((e) => !e.name.startsWith("."))
        .map((e) => ({
          name: e.name,
          path: "/" + [baseName, path, e.name].filter(Boolean).join("/"),
          isDirectory: e.isDirectory(),
        }))
        .sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) {
            return -1;
          } else if (!a.isDirectory && b.isDirectory) {
            return 1;
          } else {
            return a.name.localeCompare(b.name);
          }
        });

      return c.json(files);
    } catch (err) {}

    return c.json([]);
  })
  .get("/download/*", async (c) => {
    const dlFile = c.req.query("dl") === "true";
    const url = new URL(c.req.url, `http://${c.req.header("host")}`);
    const pathname = decodeURI(url.pathname).split("/");
    const pathSlice = pathname.slice(pathname.indexOf("download") + 1);
    const baseName = pathSlice[0];
    const path = "/" + pathSlice.slice(1).join("/");

    try {
      if (!baseName?.length) {
        throw new Error();
      }

      const baseDir = filesDirList.find((i) => i.name === baseName)?.path;
      if (!baseDir) {
        throw new Error();
      }

      const filepath = baseDir + path;
      const stat = await fs.stat(filepath);
      const size = stat.size;

      if (dlFile) {
        c.header("Content-Type", "application/octet-stream");
        c.header("Content-Disposition", `attachment; filename="${path}"`);
      } else {
        c.header("Content-Type", getMimeType(filepath));
      }

      if (c.req.method == "HEAD" || c.req.method == "OPTIONS") {
        c.header("Content-Length", size.toString());
        c.status(200);
        return c.body(null);
      }

      const range = c.req.header("range") || "";

      if (!range || dlFile) {
        c.header("Content-Length", size.toString());
        return c.body(createReadStream(filepath), 200);
      }

      c.header("Accept-Ranges", "bytes");
      c.header("Date", stat.birthtime.toUTCString());

      const parts = range.replace(/bytes=/, "").split("-", 2);
      const start = parts[0] ? parseInt(parts[0], 10) : 0;
      let end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      if (size < end - start + 1) {
        end = size - 1;
      }

      const chunksize = end - start + 1;
      const stream = createReadStream(filepath, { start, end });

      c.header("Content-Length", chunksize.toString());
      c.header("Content-Range", `bytes ${start}-${end}/${stat.size}`);

      return c.body(stream, 206);
    } catch (err) {
      throw new HTTPException(404, { message: "Not Found!" });
    }
  });

export default route;
