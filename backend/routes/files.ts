import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import fs from "node:fs/promises";
import { HTTPException } from "hono/http-exception";
import { ReadStream, createReadStream } from "node:fs";
import { ReadableStream } from "stream/web";
import mime from "mime";

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
  .get(
    "/download",
    zValidator("query", z.object({ path: z.string().min(1) })),
    async (c) => {
      const pathname = (c.req.query("path") || "").split("/");
      const path = "/" + pathname.slice(2).join("/");
      const baseName = pathname[1];

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

        // c.header("Content-Type", "application/octet-stream");
        // c.header("Content-Disposition", `attachment; filename="${path}"`);

        c.header(
          "Content-Type",
          mime.getType(filepath) || "application/octet-stream"
        );

        if (c.req.method == "HEAD" || c.req.method == "OPTIONS") {
          c.header("Content-Length", size.toString());
          c.status(200);
          return c.body(null);
        }

        const range = c.req.header("range") || "";

        if (!range) {
          c.header("Content-Length", size.toString());
          return c.body(createStreamBody(createReadStream(filepath)), 200);
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

        return c.body(createStreamBody(stream), 206);
      } catch (err) {
        console.error(err);
        throw new HTTPException(404, { message: "Not Found!" });
      }
    }
  );

const createStreamBody = (stream: ReadStream) => {
  const body = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on("end", () => {
        controller.close();
      });
    },

    cancel() {
      stream.destroy();
    },
  });
  return body;
};

export default route;
