import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import * as jwt from "hono/jwt";

const JWT_SECRET =
  process.env.JWT_SECRET || "75396f4ba17e0012d4511b8d4a5bae11c51008a3";

export const generateToken = async (data: any) => {
  return jwt.sign(data, JWT_SECRET);
};

export const verifyToken = async (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export const authMiddleware = async (ctx: Context, next: Next) => {
  const authHeader = ctx.req.raw.headers.get("Authorization");
  const queryToken = ctx.req.query("token");
  let token;

  if (authHeader) {
    const parts = authHeader.split(/\s+/);
    if (parts.length !== 2) {
      throw new HTTPException(401, { message: "Unauthorized!" });
    } else {
      token = parts[1];
    }
  }

  if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized!" });
  }

  let payload;
  try {
    payload = await jwt.verify(token, JWT_SECRET);
  } catch (e) {}

  if (!payload) {
    throw new HTTPException(401, { message: "Unauthorized!" });
  }

  ctx.set("jwtPayload", payload);
  await next();
};
