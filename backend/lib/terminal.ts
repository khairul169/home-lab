import Pty from "node-pty";
import type { WebSocket } from "ws";

type TerminalClient = WebSocket & { tty?: Pty.IPty | null };

export const createTerminalSession = (client: TerminalClient) => {
  // Each client will have own terminal
  const tty = Pty.spawn(process.env.TERMINAL_SHELL || "bash", [], {
    name: "xterm-color",
    cols: 80,
    rows: 24,
    cwd: process.env.PWD,
    env: process.env,
  });
  client.tty = tty;

  tty.onExit(() => {
    client.tty = null;
    client.close();
  });

  tty.onData(function (data) {
    client.send(data);
  });

  client.on("close", function () {
    if (client.tty) {
      client.tty.kill("SIGINT");
      client.tty = null;
    }
  });

  client.on("message", function (data) {
    const msg = data.toString("utf-8");

    if (msg.startsWith("resize:")) {
      const [cols, rows] = msg.split(":")[1].split(",");
      if (client.tty) {
        client.tty.resize(parseInt(cols), parseInt(rows));
      }
      return;
    }

    client.tty && client.tty.write(msg);
  });
};
