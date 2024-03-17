import type { WebSocket } from "ws";
import { websockify } from "./websockify";
import net from "node:net";
import { spawn } from "node:child_process";

const VNC_PORT = parseInt(process.env.VNC_PORT || "") || 5901;
const VNC_START_CMD = process.env.VNC_START_CMD;

export const createVNCSession = async (ws: WebSocket) => {
  const isVncStarted = await isPortOpen(VNC_PORT);

  // VNC is not started, start it.
  if (!isVncStarted && VNC_START_CMD) {
    const cmd = VNC_START_CMD.split(" ");
    const child = spawn(cmd[0], cmd.slice(1));

    await new Promise((resolve) => {
      child.on("close", () => resolve(null));
    });
  }

  websockify(ws, "localhost", VNC_PORT);
};

async function isPortOpen(port: number) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once("error", function (err: any) {
        resolve(err.code === "EADDRINUSE");
      })
      .once("listening", function () {
        tester.close();
        resolve(false);
      })
      .listen(port);
  });
}
