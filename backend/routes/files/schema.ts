import { z } from "zod";

export const getFilesSchema = z
  .object({
    path: z.string(),
  })
  .partial()
  .optional();

export type GetFilesSchema = z.infer<typeof getFilesSchema>;

export const uploadSchema = z.object({
  path: z.string().min(1),
  size: z.string().min(1),
});

export type UploadSchema = z.infer<typeof uploadSchema>;

export const ytdlSchema = z.object({
  url: z.string().min(1),
  path: z.string().min(1),
});

export type YtdlSchema = z.infer<typeof ytdlSchema>;
