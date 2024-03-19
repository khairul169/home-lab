import type { Context } from "hono";
import fs from "node:fs/promises";
import { uploadSchema } from "./schema";
import { HTTPException } from "hono/http-exception";
import { getFilePath } from "./utils";

export const upload = async (c: Context) => {
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
};
