import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { generateToken } from "../lib/jwt";
import { nanoid } from "nanoid";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
type LoginSchema = z.infer<typeof loginSchema>;

const route = new Hono().post(
  "/login",
  zValidator("json", loginSchema),
  async (c) => {
    const input: LoginSchema = await c.req.json();
    const { AUTH_USERNAME, AUTH_PASSWORD } = process.env;

    if (input.username !== AUTH_USERNAME || input.password !== AUTH_PASSWORD) {
      throw new HTTPException(400, {
        message: "Username or password is invalid!",
      });
    }

    const data = { sessionId: nanoid() };
    const token = await generateToken(data);

    return c.json({ token, ...data });
  }
);

export default route;
