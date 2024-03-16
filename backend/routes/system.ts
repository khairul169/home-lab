import { Hono } from "hono";
import si from "systeminformation";
import { formatBytes, secondsToTime } from "../lib/utils";

const route = new Hono().get("/", async (c) => {
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
});

export default route;
