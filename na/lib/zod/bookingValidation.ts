import { z } from "zod";
import { Constants } from "@/lib/database.types";

// --- Enums (samme verdier som DB, snake_case) ---
const bookingTypeEnum = z.enum(Constants.public.Enums.booking_type);
const bookingStatusEnum = z.enum(Constants.public.Enums.booking_status);

// --- Telefonnummer: kun siffer og vanlige tegn (+ - mellomrom parentes), minst 8 siffer ---
const PHONE_MIN_DIGITS = 8;
const phoneRegex = /^[\d\s+\-()]+$/;

function countDigits(str: string): number {
  return (str.match(/\d/g) ?? []).length;
}

function hasAtLeastTwoWords(str: string): boolean {
  return str.trim().split(/\s+/).filter(Boolean).length >= 2;
}

const phoneSchema = z
  .string({ message: "Telefonnummer er påkrevd." })
  .trim()
  .min(1, "Telefonnummer er påkrevd.")
  .refine((val) => phoneRegex.test(val), {
    message:
      "Telefonnummer kan bare inneholde tall, +, -, mellomrom og parenteser.",
  })
  .refine((val) => countDigits(val) >= PHONE_MIN_DIGITS, {
    message: "Telefonnummer må ha minst 8 siffer.",
  });

function normalizePhone(str: string): string {
  return (str.match(/\d/g) ?? []).join("");
}

// --- Participant (deltaker) – gruppebestilling, offentlig flyt ---
// Vanlig deltaker: navn (fullt navn), e-post, telefonnummer.
// Kontaktperson ved nødstilfeller (SOS): navn og telefon.
export const ParticipantSchema = z.object({
  name: z
    .string({ message: "Navn er påkrevd." })
    .trim()
    .min(1, "Navn er påkrevd.")
    .refine(hasAtLeastTwoWords, {
      message: "Skriv fullt navn (fornavn og etternavn).",
    }),
  email: z
    .string({ message: "E-post er påkrevd." })
    .trim()
    .min(1, "E-post er påkrevd.")
    .email("Ugyldig e-postadresse."),
  telefon: phoneSchema,
  sos_navn: z
    .string({ message: "Navn på nødkontakt er påkrevd." })
    .trim()
    .min(1, "Navn på nødkontakt er påkrevd.")
    .refine(hasAtLeastTwoWords, {
      message: "Skriv fullt navn (fornavn og etternavn).",
    }),
  sos_telefon: phoneSchema,
});

// --- Booking form (offentlig) – deltakere + valgfritt ekspert-bekreftelse ---
const bookingFormSchemaBase = z.object({
  participants: z
    .array(ParticipantSchema)
    .min(1, "Minst én deltaker må oppgis."),
  readExpertInfo: z.boolean().optional(),
});

export const bookingFormSchema = bookingFormSchemaBase.superRefine(
  (data, ctx) => {
    const participants = data.participants;

    participants.forEach((participant, i) => {
      const sosName = participant.sos_navn.trim().toLowerCase();
      const sosPhone = normalizePhone(participant.sos_telefon);

      const isSosSameAsAnyParticipant = participants.some((other) => {
        const otherName = other.name.trim().toLowerCase();
        const otherPhone = normalizePhone(other.telefon);

        // Ikke tillat at nødkontakt er samme som noen deltaker (inkl. seg selv)
        return sosName === otherName && sosPhone === otherPhone;
      });

      if (isSosSameAsAnyParticipant) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Nødkontakt kan ikke være en av deltakerne. Oppgi en annen person.",
          path: ["participants", i, "sos_navn"],
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Nødkontakt kan ikke være en av deltakerne. Oppgi en annen person.",
          path: ["participants", i, "sos_telefon"],
        });
      }
    });
  },
);

/** Schema for bestilling når turen er ekspertnivå – krever at bruker har bekreftet at de har lest ekspertinfo. */
export function getBookingFormSchemaForExpert() {
  return bookingFormSchema.refine((data) => data.readExpertInfo === true, {
    message:
      "Du må bekrefte at du har lest informasjonen om ekspertnivå før du kan bestille.",
    path: ["readExpertInfo"],
  });
}

// --- Booking record (admin / server) – navn, epost, dato, status, beløp, type, hva de bestilte ---
const optionalString = z
  .string()
  .trim()
  .transform((val) => (val === "" ? undefined : val))
  .optional();

export const bookingRecordSchema = z.object({
  navn: z
    .string({ message: "Navn er påkrevd." })
    .trim()
    .min(1, "Navn er påkrevd."),
  epost: z
    .string({ message: "E-post er påkrevd." })
    .trim()
    .min(1, "E-post er påkrevd.")
    .email("Ugyldig e-postadresse."),
  dato: z.coerce
    .date({ message: "Dato er påkrevd." })
    .refine((d) => !Number.isNaN(d.getTime()), { message: "Ugyldig dato." }),
  status: bookingStatusEnum,
  belop: z.coerce
    .number({ message: "Beløp må være et tall." })
    .min(0, "Beløp kan ikke være negativt."),
  type: bookingTypeEnum.default("tur"),
  tour_id: z.string().uuid("Ugyldig tur-id.").optional().nullable(),
  telefon: z
    .string({ message: "Telefonnummer er påkrevd." })
    .trim()
    .min(1, "Telefonnummer er påkrevd.")
    .refine(
      (val) => phoneRegex.test(val) && countDigits(val) >= PHONE_MIN_DIGITS,
      {
        message:
          "Ugyldig telefonnummer. Minst 8 siffer, kun tall og + - ( ) tillatt.",
      },
    ),
  notater: optionalString.nullable(),
  betalt_belop: z.coerce
    .number()
    .min(0, "Betalt beløp kan ikke være negativt.")
    .optional()
    .nullable(),
});

// Admin-skjema: booking-felter + valgfritt antall deltakere / participants
export const adminBookingFormSchema = bookingRecordSchema
  .extend({
    participants: z.array(ParticipantSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status !== "delvis_betalt") return;
    const paid = data.betalt_belop;
    if (paid == null || Number.isNaN(paid)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ved delvis betalt må betalt beløp oppgis.",
        path: ["betalt_belop"],
      });
      return;
    }
    if (paid > data.belop) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Betalt beløp kan ikke overstige totalbeløp.",
        path: ["betalt_belop"],
      });
    }
  });

// --- Eksporterte typer ---
export type ParticipantInput = z.infer<typeof ParticipantSchema>;
export type BookingFormValues = z.infer<typeof bookingFormSchema>;
export type BookingRecordInput = z.infer<typeof bookingRecordSchema>;
export type AdminBookingFormValues = z.infer<typeof adminBookingFormSchema>;

// --- Venteliste (offentlig) – én person, én plass ---
export const waitlistSchema = z.object({
  tourId: z.string().uuid("Ugyldig tur-id."),
  name: z
    .string({ message: "Navn er påkrevd." })
    .trim()
    .min(1, "Navn er påkrevd."),
  email: z
    .string({ message: "E-post er påkrevd." })
    .trim()
    .min(1, "E-post er påkrevd.")
    .email("Ugyldig e-postadresse."),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

// Display-navn for status (UI: Betalt, Ikke betalt, osv.)
export const BOOKING_STATUS_LABELS: Record<
  z.infer<typeof bookingStatusEnum>,
  string
> = {
  betalt: "Betalt",
  ikke_betalt: "Ikke betalt",
  venteliste: "Venteliste",
  kansellert: "Kansellert",
  delvis_betalt: "Delvis betalt",
};

export const BOOKING_TYPE_LABELS: Record<
  z.infer<typeof bookingTypeEnum>,
  string
> = {
  tur: "Tur",
};
