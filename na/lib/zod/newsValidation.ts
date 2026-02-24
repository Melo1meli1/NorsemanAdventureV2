import { z } from "zod";

export const newsStatusEnum = z.enum(["draft", "published"]);

export const createNewsSchema = z.object({
  title: z
    .string({ required_error: "Tittel er påkrevd" })
    .min(1, "Tittel er påkrevd")
    .max(200, "Maks 200 tegn"),
  short_description: z
    .string()
    .max(500, "Maks 500 tegn")
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .max(10000, "Maks 10 000 tegn")
    .optional()
    .or(z.literal("")),
  image_url: z.string().url("Ugyldig URL").optional().or(z.literal("")),
  status: newsStatusEnum.default("draft"),
  published_at: z.coerce.date().optional().nullable(),
});

export const updateNewsSchema = z.object({
  id: z.string().uuid("Ugyldig ID"),
  title: z
    .string()
    .min(1, "Tittel er påkrevd")
    .max(200, "Maks 200 tegn")
    .optional(),
  short_description: z
    .string()
    .max(500, "Maks 500 tegn")
    .optional()
    .or(z.literal("")),
  content: z
    .string()
    .max(10000, "Maks 10 000 tegn")
    .optional()
    .or(z.literal("")),
  image_url: z.string().url("Ugyldig URL").optional().or(z.literal("")),
  status: newsStatusEnum.optional(),
  published_at: z.coerce.date().optional().nullable(),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
export type NewsStatus = z.infer<typeof newsStatusEnum>;
