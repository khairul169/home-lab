import type { WebSocket } from "ws";
import net from "node:net";

// const log = console.log;
const log = (..._args: any[]) => null;

export const websockify = (
  client: WebSocket,
  targetHost: string,
  targetPort: number
) => {
  const target = net.createConnection(targetPort, targetHost, function () {
    log("connected to target");
  });

  target.on("data", function (data) {
    try {
      client.send(data);
    } catch (e) {
      log("Client closed, cleaning up target");
      target.end();
    }
  });

  target.on("end", function () {
    log("target disconnected");
    client.close();
  });

  target.on("error", function () {
    log("target connection error");
    target.end();
    client.close();
  });

  client.on("message", function (msg) {
    // log("CLIENT message: " + msg);
    target.write(msg as never);
  });

  client.on("close", function (code, reason) {
    log("WebSocket client disconnected: " + code + " [" + reason + "]");
    target.end();
  });

  client.on("error", function (a) {
    log("WebSocket client error: " + a);
    target.end();
  });
};
