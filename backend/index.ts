import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import si from "systeminformation";

const formatBytes = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "n/a";
  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))), 10);
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
};

const secondsToTime = (seconds: number) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  // const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m`;
};

const app = new Hono()
  .use(cors())

  .get("/system", async (c) => {
    const date = new Date().toISOString();
    const uptime = secondsToTime(si.time().uptime || 0);
    const system = await si.system();

    const cpuSpeed = await si.cpuCurrentSpeed();
    const cpuTemp = await si.cpuTemperature();
    const cpuLoad = await si.currentLoad();
    const mem = await si.mem();

    const perf = {
      cpu: {
        load: cpuLoad.currentLoad,
        speed: cpuSpeed.avg,
        temp: cpuTemp.main,
      },
      mem: {
        total: formatBytes(mem.total),
        percent: (mem.active / mem.total) * 100,
        used: formatBytes(mem.active),
        free: formatBytes(mem.total - mem.active),
      },
    };

    const fsMounts = await si.fsSize();
    const storage = fsMounts
      .filter(
        (i) =>
          i.size > 32 * 1024 * 1024 * 1024 &&
          !i.mount.startsWith("/var/lib/docker")
      )
      .map((i) => ({
        type: i.type,
        mount: i.mount,
        used: formatBytes(i.used),
        percent: (i.used / i.size) * 100,
        total: formatBytes(i.size),
        free: formatBytes(i.available),
      }));

    return c.json({ uptime, date, system, perf, storage });
  })

  .get(
    "/process",
    zValidator(
      "query",
      z
        .object({ sort: z.enum(["cpu", "mem"]), limit: z.coerce.number() })
        .partial()
        .optional()
    ),
    async (c) => {
      const memTotal = (await si.mem()).total;
      const sort = c.req.query("sort") || "mem";
      const limit = parseInt(c.req.query("limit") || "") || 10;

      let processList = (await si.processes()).list;

      if (sort) {
        switch (sort) {
          case "cpu":
            processList = processList.sort((a, b) => b.cpu - a.cpu);
            break;
          case "mem":
            processList = processList.sort((a, b) => b.mem - a.mem);
            break;
        }
      }

      const list = processList
        .map((p) => ({
          name: p.name,
          cmd: [p.name, p.params].filter(Boolean).join(" "),
          cpu: p.cpu,
          cpuPercent: p.cpu.toFixed(1) + "%",
          mem: p.mem,
          memUsage: formatBytes((p.mem / 100) * memTotal),
          path: p.path,
          user: p.user,
        }))
        .slice(0, limit);

      return c.json({ list });
    }
  )

  .use("*", serveStatic({ root: "./public" }));

export type AppType = typeof app;

export default app;
