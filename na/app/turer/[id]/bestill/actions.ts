"use server";

import { createClient } from "@/lib/supabase/supabase-server";
import {
  adminBookingFormSchema,
  bookingFormSchema,
  type AdminBookingFormValues,
  type BookingFormValues,
} from "@/lib/zod/bookingValidation";
import type { Database } from "@/lib/database.types";

/**
 * Server Actions for booking (offentlig + admin).
 * Transaction: to separate inserts (bookings, participants) med cleanup ved feil:
 * hvis participants-insert feiler, slettes booking-raden. For atomisk transaksjon,
 * bruk en RPC i Supabase som gjør begge inserts i pl/pgsql.
 */

type BookingStatus = Database["public"]["Enums"]["booking_status"];
type BookingType = Database["public"]["Enums"]["booking_type"];

export type CreateBookingFromPublicInput = {
  tourId: string;
  participants: BookingFormValues["participants"];
  belop: number;
  /** Valgfritt: telefon og notater på booking-nivå (f.eks. hovedbestillers telefon). */
  telefon?: string | null;
  notater?: string | null;
};

export type CreateBookingFromPublicResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

/**
 * Oppretter en booking og alle deltakere (offentlig bestillingsflyt).
 * Navn/epost på booking = første deltaker; dato = i dag; status = ikke_betalt; type = tur.
 */
export async function createBookingFromPublic(
  input: CreateBookingFromPublicInput,
): Promise<CreateBookingFromPublicResult> {
  const parsed = bookingFormSchema.safeParse({
    participants: input.participants,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().formErrors[0] ?? "Ugyldig skjemadata.",
    };
  }

  const participants = parsed.data.participants;
  if (participants.length === 0) {
    return { success: false, error: "Minst én deltaker må oppgis." };
  }

  const first = participants[0];
  const navn = first.name.trim();
  const epost = first.email.trim();
  const dato = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const status: BookingStatus = "ikke_betalt";
  const type: BookingType = "tur";

  const supabase = await createClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      navn,
      epost,
      dato,
      status,
      belop: input.belop,
      type,
      tour_id: input.tourId,
      telefon: input.telefon ?? null,
      notater: input.notater ?? null,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    return {
      success: false,
      error: bookingError?.message ?? "Kunne ikke opprette bestilling.",
    };
  }

  const participantRows = participants.map((p) => ({
    booking_id: booking.id,
    name: p.name.trim(),
    email: p.email.trim(),
    telefon: p.telefon.trim(),
    sos_navn: p.sos_navn.trim(),
    sos_telefon: p.sos_telefon.trim(),
  }));

  const { error: participantsError } = await supabase
    .from("participants")
    .insert(participantRows);

  if (participantsError) {
    await supabase.from("bookings").delete().eq("id", booking.id);
    return {
      success: false,
      error:
        participantsError.message ??
        "Kunne ikke lagre deltakere. Bestillingen ble ikke opprettet.",
    };
  }

  return { success: true, bookingId: booking.id };
}

// --- Admin: manuell bestilling ---

export type CreateBookingFromAdminInput = AdminBookingFormValues;

export type CreateBookingFromAdminResult =
  | { success: true; bookingId: string }
  | { success: false; error: string };

/**
 * Oppretter en booking (og evt. deltakere) fra admin-skjema «Legg til manuell bestilling».
 * Alle booking-felter (navn, epost, dato, status, beløp, type, tour_id, telefon, notater) kommer fra skjemaet.
 */
export async function createBookingFromAdmin(
  input: CreateBookingFromAdminInput,
): Promise<CreateBookingFromAdminResult> {
  const parsed = adminBookingFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().formErrors[0] ?? "Ugyldig skjemadata.",
    };
  }

  const data = parsed.data;
  const participants = data.participants ?? [];

  const supabase = await createClient();

  const datoStr =
    data.dato instanceof Date
      ? data.dato.toISOString().slice(0, 10)
      : new Date(data.dato).toISOString().slice(0, 10);

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      navn: data.navn.trim(),
      epost: data.epost.trim(),
      dato: datoStr,
      status: data.status,
      belop: data.belop,
      type: data.type ?? "tur",
      tour_id: data.tour_id ?? null,
      telefon: data.telefon ?? null,
      notater: data.notater ?? null,
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    return {
      success: false,
      error: bookingError?.message ?? "Kunne ikke opprette bestilling.",
    };
  }

  if (participants.length > 0) {
    const participantRows = participants.map((p) => ({
      booking_id: booking.id,
      name: p.name.trim(),
      email: p.email.trim(),
      telefon: p.telefon.trim(),
      sos_navn: p.sos_navn.trim(),
      sos_telefon: p.sos_telefon.trim(),
    }));

    const { error: participantsError } = await supabase
      .from("participants")
      .insert(participantRows);

    if (participantsError) {
      await supabase.from("bookings").delete().eq("id", booking.id);
      return {
        success: false,
        error:
          participantsError.message ??
          "Kunne ikke lagre deltakere. Bestillingen ble ikke opprettet.",
      };
    }
  }

  return { success: true, bookingId: booking.id };
}
