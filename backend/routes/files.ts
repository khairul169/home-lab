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

const uploadSchema = z.object({
  path: z.string().min(1),
  size: z.string().min(1),
});

const filesDirList = process.env.FILE_DIRS
  ? process.env.FILE_DIRS.split(";").map((i) => ({
      name: i.split("/").at(-1),
      path: i,
    }))
  : [];

const route = new Hono()
  .get("/", zValidator("query", getFilesSchema), async (c) => {
    const input: z.infer<typeof getFilesSchema> = c.req.query();
    const { baseName, path, pathname } = getFilePath(input.path);

    if (!baseName?.length) {
      return c.json(
        filesDirList.map((i) => ({
          name: i.name,
          path: "/" + i.name,
          isDirectory: true,
        }))
      );
    }

    try {
      const entities = await fs.readdir(path, { withFileTypes: true });

      const files = entities
        .filter((e) => !e.name.startsWith("."))
        .map((e) => ({
          name: e.name,
          path: [pathname, e.name].join("/"),
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
  .post("/upload", async (c) => {
    const input: any = (await c.req.parseBody()) as never;
    const data = await uploadSchema.parseAsync(input);

    const size = parseInt(input.size);
    if (Number.isNaN(size) || !size) {
      throw new HTTPException(400, { message: "Size is empty!" });
    }

    const files: File[] = [...Array(size)]
      .map((_, idx) => input[`files.${idx}`])
      .filter((i) => !!i);

    if (!files.length) {
      throw new HTTPException(400, { message: "Files is empty!" });
    }

    const { baseDir, path: targetDir } = getFilePath(data.path);
    if (!baseDir?.length) {
      throw new HTTPException(400, { message: "Path not found!" });
    }

    // files.forEach((file) => {
    //   const filepath = targetDir + "/" + file.name;
    //   if (existsSync(filepath)) {
    //     throw new HTTPException(400, { message: "File already exists!" });
    //   }
    // });

    await Promise.all(
      files.map(async (file) => {
        const filepath = targetDir + "/" + file.name;
        const buffer = await file.arrayBuffer();
        await fs.writeFile(filepath, new Uint8Array(buffer));
      })
    );

    return c.json({ success: true });
  })
  .get("/download/*", async (c) => {
    const dlFile = c.req.query("dl") === "true";
    const url = new URL(c.req.url, `http://${c.req.header("host")}`);
    const pathname = decodeURI(url.pathname).split("/");
    const pathSlice = pathname.slice(pathname.indexOf("download") + 1);
    const baseName = pathSlice[0];
    const path = "/" + pathSlice.slice(1).join("/");
    const filename = path.substring(1);

    try {
      if (!baseName?.length) {
        throw new Error("baseName is empty");
      }

      const baseDir = filesDirList.find((i) => i.name === baseName)?.path;
      if (!baseDir) {
        throw new Error("baseDir not found");
      }

      const filepath = baseDir + path;
      const stat = await fs.stat(filepath);
      const size = stat.size;

      if (dlFile) {
        c.header("Content-Type", "application/octet-stream");
        c.header(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(filename)}"`
        );
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
      // console.log("err", err);
      throw new HTTPException(404, { message: "Not Found!" });
    }
  });

function getFilePath(path?: string) {
  const pathSlices =
    path
      ?.replace(/\/{2,}/g, "/")
      .replace(/\/$/, "")
      .split("/") || [];
  const baseName = pathSlices[1] || null;
  const filePath = pathSlices.slice(2).join("/");
  const baseDir = filesDirList.find((i) => i.name === baseName)?.path;

  return {
    path: [baseDir || "", filePath].join("/").replace(/\/$/, ""),
    pathname: ["", baseName, filePath].join("/").replace(/\/$/, ""),
    baseName,
    baseDir,
    filePath,
  };
}

export default route;
