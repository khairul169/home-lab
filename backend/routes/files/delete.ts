import type { Context } from "hono";
import { z } from "zod";
import { getFilePath } from "./utils";
import fs from "fs";
import { HTTPException } from "hono/http-exception";

const schema = z.object({
  path: z.string().min(1),
});

export const deleteFile = async (c: Context) => {
  const data = schema.parse(await c.req.json());
  const { path } = getFilePath(data.path);

  if (!fs.existsSync(path)) {
    throw new HTTPException(404, { message: "File not found!" });
  }

  await fs.promises.unlink(path);

  return c.json({ result: true });
};
