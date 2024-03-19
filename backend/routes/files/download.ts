import { createReadStream } from "fs";
import fs from "node:fs/promises";
import { HTTPException } from "hono/http-exception";
import { getMimeType } from "../../lib/utils";
import { filesDirList } from "./utils";
import type { Context } from "hono";

export const download = async (c: Context) => {
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
};
