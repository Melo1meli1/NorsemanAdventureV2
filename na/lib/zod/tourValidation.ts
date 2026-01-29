import { z } from "zod";
import { Constants } from "@/lib/database.types";

const tourStatusEnum = z.enum(Constants.public.Enums.tour_status);
const vanskelighetsgradEnum = z.enum(Constants.public.Enums.vanskelighetsgrad);
const sesongEnum = z.enum(Constants.public.Enums.sesong);
const terrengEnum = z.enum(Constants.public.Enums.terreng);

const nullableString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

const startDateSchema = z.coerce
  .date({
    message: "Ugyldig startdato.",
  })
  .refine((date) => !Number.isNaN(date.getTime()), {
    message: "Ugyldig startdato.",
  });

const endDateSchema = z
  .union([
    z.coerce
      .date({
        message: "Ugyldig sluttdato.",
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
      message: "Tittel er påkrevd.",
    })
    .trim()
    .min(1, "Tittel er påkrevd."),
  short_description: nullableString,
  long_description: nullableString,
  sted: nullableString,
  vanskelighetsgrad: z
    .union([vanskelighetsgradEnum, z.literal("")])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  sesong: z
    .union([sesongEnum, z.literal("")])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  terreng: z
    .union([terrengEnum, z.literal("")])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  price: z.coerce
    .number({
      message: "Pris må være et tall.",
    })
    .positive("Pris må være større enn 0."),
  start_date: startDateSchema,
  end_date: endDateSchema,
  seats_available: z.coerce
    .number({
      message: "Antall plasser må være et tall.",
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
        message: "ID er påkrevd.",
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
