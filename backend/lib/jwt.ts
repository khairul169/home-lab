import * as jwt from "hono/jwt";

const JWT_SECRET =
  process.env.JWT_SECRET || "75396f4ba17e0012d4511b8d4a5bae11c51008a3";

export const generateToken = async (data: any) => {
  return jwt.sign(data, JWT_SECRET);
};

export const verifyToken = async (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export const authMiddleware = jwt.jwt({ secret: JWT_SECRET });
