import type { Context } from "hono";
import { getFilePath } from "./utils";
import { HTTPException } from "hono/http-exception";
import ID3 from "node-id3";
import cache from "../../middlewares/cache";

export const getId3Tags = async (c: Context) => {
  const url = new URL(c.req.url);
  const pathname = decodeURI(url.pathname).split("/");
  const uri = pathname.slice(pathname.indexOf("id3-tags") + 1).join("/");
  const { path } = getFilePath("/" + uri);

  const cached = cache.key("id3-tags", path);
  if (cached.data != null) {
    return c.json(cached.data || {});
  }

  let tags: any = false;

  try {
    const id3Tags = await ID3.Promise.read(path, { noRaw: true });
    const data: any = { ...id3Tags };

    if (data.image) {
      const imgUrl = new URL(url);
      imgUrl.pathname = imgUrl.pathname.replace("/id3-tags", "/id3-img");
      data.image = imgUrl.toString();
    }

    tags = data;
  } catch (err) {}

  cached.set(tags);

  return c.json(tags || {});
};

export const getId3Image = async (c: Context) => {
  const url = new URL(c.req.url);
  const pathname = decodeURI(url.pathname).split("/");
  const uri = pathname.slice(pathname.indexOf("id3-img") + 1).join("/");
  const { path } = getFilePath("/" + uri);

  const cached = cache.key("id3-img", path);
  if (cached.data) {
    c.header("Content-Type", cached.data.mime);
    const buffer = Buffer.from(cached.data.imageBuffer);
    return c.body(buffer);
  }

  try {
    const tags = await ID3.Promise.read(path, { noRaw: true });
    const image = tags.image;
    if (!image || typeof image === "string") {
      throw new Error("No image found!");
    }
    cached.set(image);

    c.header("Content-Type", image.mime);
    return c.body(image.imageBuffer);
  } catch (err) {
    throw new HTTPException(400, { message: "cannot get tags!" });
  }
};
