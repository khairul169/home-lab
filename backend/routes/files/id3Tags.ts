import type { Context } from "hono";

import { getFilePath } from "./utils";
import { HTTPException } from "hono/http-exception";
import ID3 from "node-id3";
import cache from "../../middlewares/cache";
import { loadDb } from "../../lib/db";

const db = loadDb("id3-tags", (db) => {
  db.exec(`CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    data TEXT NOT NULL,
    image BLOB,
    UNIQUE(path)
  )`);
});

type ID3Tag = {
  id: number;
  path: string;
  data: string;
  image: any;
};

export const getId3Tags = async (c: Context) => {
  const url = new URL(c.req.url);
  const pathname = decodeURI(url.pathname).split("/");
  const uri = pathname.slice(pathname.indexOf("id3-tags") + 1).join("/");
  const { path } = getFilePath("/" + uri);

  const cached = cache.key("id3-tags", uri);
  if (cached.data != null) {
    return c.json(cached.data || {});
  }

  let tags: any = false;

  try {
    const tagsRow = db
      .prepare("SELECT * FROM tags WHERE path = ?")
      .get(uri) as ID3Tag;

    if (tagsRow) {
      const data = JSON.parse(tagsRow.data);
      tags = { ...data, image: tagsRow.image };
    } else {
      const id3Tags = await ID3.Promise.read(path, { noRaw: true });
      const image = (id3Tags.image as any)?.imageBuffer || null;
      tags = { ...id3Tags };

      db.prepare("INSERT INTO tags (path, data, image) VALUES (?, ?, ?)").run(
        uri,
        JSON.stringify({ ...id3Tags, image: undefined }),
        image
      );
    }

    if (tags.image) {
      const imgUrl = new URL(url);
      imgUrl.pathname = imgUrl.pathname.replace("/id3-tags", "/id3-img");
      tags.image = imgUrl.toString();
    }
  } catch (err) {
    //
  } finally {
    cached.set(tags);
  }

  return c.json(tags || {});
};

export const getId3Image = async (c: Context) => {
  const url = new URL(c.req.url);
  const pathname = decodeURI(url.pathname).split("/");
  const uri = pathname.slice(pathname.indexOf("id3-img") + 1).join("/");

  const cached = cache.key("id3-img", uri);
  if (cached.data) {
    c.header("Content-Type", "image/jpeg");
    return c.body(Buffer.from(cached.data));
  }

  try {
    const tagsRow = db
      .prepare("SELECT * FROM tags WHERE path = ?")
      .get(uri) as ID3Tag;
    if (!tagsRow || !tagsRow.image) {
      throw new Error("Not found!");
    }

    cached.set(tagsRow.image);

    c.header("Content-Type", "image/jpeg");
    return c.body(tagsRow.image);
  } catch (err) {
    throw new HTTPException(400, { message: "cannot get tags!" });
  }
};
