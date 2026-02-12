import { z } from "zod";
import { platformEnum } from "@/conf/schemas";

export const uploadSongSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  era: z.string().optional(),

  year: z
    .union([z.coerce.number().int().min(1900).max(2100), z.nan()])
    .optional()
    .transform((v) =>
      typeof v === "number" && !Number.isNaN(v) ? v : undefined,
    ),

  coverUrl: z.string().url().optional().or(z.literal("")),
  sourceName: z.string().min(1, "Source name is required"),
  sourceUrl: z.string().url("Source URL must be a valid URL"),
  sourcePlatform: platformEnum.optional(),
  sourceDescription: z.string().optional(),
  producers: z.string().optional(),

  publish: z.boolean().optional(),
});

export type UploadSongFormValues = z.output<typeof uploadSongSchema>;
