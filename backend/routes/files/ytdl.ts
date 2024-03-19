import type { Context } from "hono";
import type { YtdlSchema } from "./schema";
import Queue from "better-queue";
import { nanoid } from "nanoid";
import yt2mp3, { getVideoInfo } from "../../lib/yt2mp3";
import { getFilePath } from "./utils";
import { HTTPException } from "hono/http-exception";

type Task = {
  id: string;
  path: string;
  url: string;
  title: string;
  thumb: string;
  length: string;
  status?: "pending" | "resolved" | "rejected";
};

const tasks = new Map<string, Task>();
const queue = new Queue<Task>((input: Task, cb) => {
  const { id, path, url } = input;

  const task = tasks.get(id);
  if (!task) return cb(new Error("Task not found!"));

  const out = getFilePath(path);
  if (!out.path) return cb(new Error("Path not found!"));

  tasks.set(id, { ...task, status: "pending" });

  yt2mp3(url, out.path)
    .then((data) => cb(null, data))
    .catch(cb);
});

queue.on("task_finish", (taskId: string) => {
  const task = tasks.get(taskId);
  task && tasks.set(taskId, { ...task, status: "resolved" });
  console.log("task finish!", taskId);
});

queue.on("task_failed", (taskId: string) => {
  const task = tasks.get(taskId);
  task && tasks.set(taskId, { ...task, status: "rejected" });
  console.error("task failed!", taskId);
});

export const ytdl = async (c: Context) => {
  const input: YtdlSchema = await c.req.json();

  try {
    const info = await getVideoInfo(input.url);

    const task: Task = {
      id: nanoid(),
      url: input.url,
      title: info.title,
      path: input.path,
      thumb: info.thumb?.url,
      length: info.length,
    };

    queue.push(task);
    tasks.set(task.id, task);

    return c.json(task);
  } catch (err) {
    throw new HTTPException(400, {
      message: (err as any)?.message || "Cannot download from youtube!",
    });
  }
};

export const getYtdl = async (c: Context) => {
  const id = c.req.param("id");
  return c.json(tasks.get(id));
};
