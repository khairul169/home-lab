import { WebSocketServer } from "ws";
import { verifyToken } from "./lib/jwt";
import { createTerminalSession } from "./lib/terminal";

const createWsServer = (server: any) => {
  const wss = new WebSocketServer({ server: server as never });

  wss.on("connection", async (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    try {
      await verifyToken(token || "");
    } catch (err) {
      console.log(err);
      ws.close();
      return;
    }

    if (url.pathname === "/terminal") {
      createTerminalSession(ws);
    }

    ws.on("error", console.error);
  });
};

export default createWsServer;
