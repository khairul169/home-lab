import { Hono } from "hono";
import si from "systeminformation";
import { formatBytes } from "../lib/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const route = new Hono().get(
  "/",
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
);

export default route;
