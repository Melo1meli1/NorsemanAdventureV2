import { z } from "zod";
import { Constants } from "@/lib/database.types";

// --- Enums (samme verdier som DB, snake_case) ---
const bookingTypeEnum = z.enum(Constants.public.Enums.booking_type);
const bookingStatusEnum = z.enum(Constants.public.Enums.booking_status);

// --- Participant (deltaker) – gruppebestilling, offentlig flyt ---
// Vanlig deltaker: navn (fullt navn), e-post, telefonnummer.
// Kontaktperson ved nødstilfeller (SOS): navn og telefon.
export const ParticipantSchema = z.object({
  name: z
    .string({ message: "Navn er påkrevd." })
    .trim()
    .min(1, "Navn er påkrevd."),
  email: z
    .string({ message: "E-post er påkrevd." })
    .trim()
    .min(1, "E-post er påkrevd.")
    .email("Ugyldig e-postadresse."),
  telefon: z
    .string({ message: "Telefonnummer er påkrevd." })
    .trim()
    .min(1, "Telefonnummer er påkrevd."),
  sos_navn: z
    .string({ message: "Navn på nødkontakt er påkrevd." })
    .trim()
    .min(1, "Navn på nødkontakt er påkrevd."),
  sos_telefon: z
    .string({ message: "Telefon til nødkontakt er påkrevd." })
    .trim()
    .min(1, "Telefon til nødkontakt er påkrevd."),
});

// --- Booking form (offentlig) – kun deltakere; rest settes av server ---
export const bookingFormSchema = z.object({
  participants: z
    .array(ParticipantSchema)
    .min(1, "Minst én deltaker må oppgis."),
});

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
  telefon: optionalString.nullable(),
  notater: optionalString.nullable(),
});

// Admin-skjema: booking-felter + valgfritt antall deltakere / participants
export const adminBookingFormSchema = bookingRecordSchema.extend({
  participants: z.array(ParticipantSchema).optional(),
});

// --- Eksporterte typer ---
export type ParticipantInput = z.infer<typeof ParticipantSchema>;
export type BookingFormValues = z.infer<typeof bookingFormSchema>;
export type BookingRecordInput = z.infer<typeof bookingRecordSchema>;
export type AdminBookingFormValues = z.infer<typeof adminBookingFormSchema>;

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
