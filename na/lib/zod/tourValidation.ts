import { z } from "zod";
import { Constants } from "@/lib/database.types";

const tourStatusEnum = z.enum(Constants.public.Enums.tour_status);
const vanskelighetsgradEnum = z.enum(Constants.public.Enums.vanskelighetsgrad);
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
    if (value instanceof Date) return value;
    return null;
  })
  .nullable()
  .optional();

// ── Shared enum/select fields ──
const optionalEnumField = (enumSchema: z.ZodEnum<[string, ...string[]]>) =>
  z
    .union([enumSchema, z.literal("")])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

// ── Draft schema: very lenient, almost nothing required ──
export const draftTourSchema = z.object({
  title: z.string().trim().default(""),
  short_description: z.string().trim().default(""),
  long_description: nullableString,
  hoydepunkter: nullableString,
  sted: z.string().trim().default(""),
  vanskelighetsgrad: optionalEnumField(vanskelighetsgradEnum),
  terreng: optionalEnumField(terrengEnum),
  price: z.coerce.number().nonnegative().default(0),
  start_date: z
    .union([startDateSchema, z.literal("").transform(() => null), z.null()])
    .nullable()
    .optional(),
  end_date: endDateSchema,
  seats_available: z.coerce.number().int().min(0).default(0),
  total_seats: z.coerce.number().int().min(0).default(0),
  image_url: nullableString,
  status: tourStatusEnum.default("draft"),
});

// ── Published schema: strict, all mandatory fields required ──
export const baseTourSchema = z.object({
  title: z
    .string({
      message: "Tittel er påkrevd.",
    })
    .trim()
    .min(1, "Tittel er påkrevd."),
  short_description: z
    .string({
      message: "Kort beskrivelse er påkrevd.",
    })
    .trim()
    .min(1, "Kort beskrivelse er påkrevd."),
  long_description: nullableString,
  hoydepunkter: nullableString,
  sted: z
    .string({
      message: "Sted er påkrevd.",
    })
    .trim()
    .min(1, "Sted er påkrevd."),
  vanskelighetsgrad: optionalEnumField(vanskelighetsgradEnum),
  terreng: optionalEnumField(terrengEnum),
  price: z.coerce
    .number({
      message: "Pris må være et tall.",
    })
    .positive("Pris må være større enn 0."),
  start_date: startDateSchema,
  end_date: endDateSchema,
  seats_available: z.coerce
    .number({
      message: "Ledige plasser er påkrevd.",
    })
    .int("Ledige plasser må være et heltall.")
    .min(0, "Ledige plasser kan ikke være negativ."),
  total_seats: z.coerce
    .number({
      message: "Totalt antall plasser er påkrevd.",
    })
    .int("Totalt antall plasser må være et heltall.")
    .min(1, "Totalt antall plasser må være minst 1."),
  image_url: nullableString,
  status: tourStatusEnum.default("draft"),
});

export const createTourSchema = baseTourSchema
  .refine((data) => data.end_date != null, {
    message: "Sluttdato er påkrevd.",
    path: ["end_date"],
  })
  .refine((data) => data.seats_available <= data.total_seats, {
    message: "Ledige plasser kan ikke være flere enn totalt antall plasser.",
    path: ["seats_available"],
  })
  .superRefine((data, ctx) => {
    if (data.end_date != null && data.end_date <= data.start_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "Sluttdato må være etter startdato.",
      });
    }
  });

export const createDraftTourSchema = draftTourSchema;

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
    const endDate = data.end_date;
    if (
      data.start_date !== undefined &&
      endDate != null &&
      endDate <= data.start_date
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "Sluttdato må være etter startdato.",
      });
    }
    if (
      data.seats_available !== undefined &&
      data.total_seats !== undefined &&
      data.seats_available > data.total_seats
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["seats_available"],
        message:
          "Ledige plasser kan ikke være flere enn totalt antall plasser.",
      });
    }
  });

export const updateDraftTourSchema = draftTourSchema.extend({
  id: z
    .string({
      message: "ID er påkrevd.",
    })
    .uuid({
      message: "Ugyldig tur-id.",
    }),
});

export type CreateTourInput = z.infer<typeof createTourSchema>;
export type CreateDraftTourInput = z.infer<typeof createDraftTourSchema>;
export type UpdateTourInput = z.infer<typeof updateTourSchema>;
export type UpdateDraftTourInput = z.infer<typeof updateDraftTourSchema>;
