import { Hono } from "hono";
import wol from "wol";
import { HTTPException } from "hono/http-exception";

const route = new Hono().post("/wakepc", async (c) => {
  const { PC_MAC_ADDR } = process.env;

  try {
    await new Promise((resolve, reject) => {
      wol.wake(PC_MAC_ADDR || "", (err: any, res: any) =>
        err ? reject(err) : resolve(res)
      );
    });
  } catch (err) {
    console.log(err);
    throw new HTTPException(400, { message: "Cannot wake pc up!" });
  }

  return c.json({ message: "waking up..." });
});

export default route;
