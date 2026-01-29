import { z } from "zod";
import { Constants } from "@/lib/database.types";

const tourStatusEnum = z.enum(Constants.public.Enums.tour_status);

const nullableString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

const startDateSchema = z.coerce
  .date({
    error: "Ugyldig startdato.",
  })
  .refine((date) => !Number.isNaN(date.getTime()), {
    message: "Ugyldig startdato.",
  });

const endDateSchema = z
  .union([
    z.coerce
      .date({
        error: "Ugyldig sluttdato.",
      })
      .refine((date) => !Number.isNaN(date.getTime()), {
        message: "Ugyldig sluttdato.",
      }),
    z.literal("").transform(() => null),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => {
    if (value instanceof Date) {
      return value;
    }

    return null;
  })
  .nullable()
  .optional();

export const baseTourSchema = z.object({
  title: z
    .string({
      error: "Tittel er påkrevd.",
    })
    .trim()
    .min(1, "Tittel er påkrevd."),
  description: nullableString,
  price: z.coerce
    .number({
      error: "Pris må være et tall.",
    })
    .positive("Pris må være større enn 0."),
  start_date: startDateSchema,
  end_date: endDateSchema,
  seats_available: z.coerce
    .number({
      error: "Antall plasser må være et tall.",
    })
    .int("Antall plasser må være et heltall.")
    .min(0, "Antall plasser kan ikke være negativt."),
  image_url: nullableString,
  status: tourStatusEnum.default("draft"),
});

export const createTourSchema = baseTourSchema.superRefine((data, ctx) => {
  if (data.end_date && data.end_date <= data.start_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["end_date"],
      message: "Sluttdato må være etter startdato.",
    });
  }
});

export const updateTourSchema = baseTourSchema
  .partial()
  .extend({
    id: z
      .string({
        error: "ID er påkrevd.",
      })
      .uuid({
        message: "Ugyldig tur-id.",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.start_date && data.end_date && data.end_date <= data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "Sluttdato må være etter startdato.",
      });
    }
  });

export type CreateTourInput = z.infer<typeof createTourSchema>;
export type UpdateTourInput = z.infer<typeof updateTourSchema>;
