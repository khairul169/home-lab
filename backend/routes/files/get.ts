import type { Context } from "hono";
import type { GetFilesSchema } from "./schema";
import fs from "node:fs/promises";
import { filesDirList, getFilePath } from "./utils";

export const getFiles = async (c: Context) => {
  const input: GetFilesSchema = c.req.query();
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
};
