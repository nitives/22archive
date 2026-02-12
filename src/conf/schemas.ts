import { z } from "zod";

export const platformEnum = z.enum([
  "SoundCloud",
  "YouTube",
  "Bandcamp",
  "Spotify",
  "AppleMusic",
  "Other",
]);

export const roleEnum = z.enum(["ADMIN", "TRUSTED", "PENDING"]);

export const songIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const userIdParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const trustedUploadBodySchema = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
  era: z.string().nullable().optional(),
  year: z.number().int().min(1900).max(2100).nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  audioPath: z.string().min(1),

  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  sourcePlatform: platformEnum.nullable().optional(),
  sourceDescription: z.string().nullable().optional(),

  producers: z.array(z.string().min(1)).default([]),
});

export const adminUploadBodySchema = trustedUploadBodySchema.extend({
  publish: z.boolean().default(false),
});
