"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import { sendEmail } from "@/lib/mail";
import {
  adminBookingFormSchema,
  bookingFormSchema,
  waitlistSchema,
  type AdminBookingFormValues,
  type BookingFormValues,
  type WaitlistInput,
} from "@/lib/zod/bookingValidation";
import type { BookingStatus, BookingType } from "@/lib/types";
import {
  getRemainingSeatsForTour,
  getWaitlistForTour,
} from "@/lib/bookingUtils";

/**
 * Server Actions for booking (offentlig + admin).
 * Transaction: to separate inserts (bookings, participants) med cleanup ved feil:
 * hvis participants-insert feiler, slettes booking-raden. For atomisk transaksjon,
 * bruk en RPC i Supabase som gjør begge inserts i pl/pgsql.
 */

export type CreateBookingFromPublicInput = {
  tourId: string;
  participants: BookingFormValues["participants"];
  belop: number;
  telefon?: string;
  notater?: string | null;
  readExpertInfo?: boolean;
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

  const requestedSeats = participants.length;

  const supabase = await createClient();

  // Server-side kapasitetssjekk akkurat idet vi starter betaling.
  const availability = await getRemainingSeatsForTour(supabase, input.tourId);

  if (!availability.success) {
    return {
      success: false,
      error: availability.error,
    };
  }

  const remainingSeats = availability.remainingSeats;

  if (requestedSeats > remainingSeats) {
    return {
      success: false,
      error:
        remainingSeats <= 0
          ? "Denne turen er dessverre utsolgt. Du kan sette deg på venteliste."
          : `Det er bare ${remainingSeats} plasser igjen.`,
    };
  }

  const { data: tour } = await supabase
    .from("tours")
    .select("vanskelighetsgrad")
    .eq("id", input.tourId)
    .single();

  if (tour?.vanskelighetsgrad === "ekspert" && input.readExpertInfo !== true) {
    return {
      success: false,
      error:
        "Du må bekrefte at du har lest informasjonen om ekspertnivå før du kan bestille.",
    };
  }

  const first = participants[0];
  const navn = first.name.trim();
  const epost = first.email.trim();
  const dato = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const status: BookingStatus = "ikke_betalt";
  const type: BookingType = "tur";
  // Use provided telefon or fall back to first participant's telefon
  const telefon = input.telefon?.trim() || first.telefon.trim();

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
      telefon,
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

  const letsregBaseUrl = process.env.LETSREG_BASE_URL;
  const ref = booking.id;

  if (letsregBaseUrl) {
    // Produksjon: redirect til ekte LetsReg-betaling
    redirect(`${letsregBaseUrl}?ref=${ref}`);
  }

  // Mangler LETSREG_BASE_URL (f.eks. på Vercel uten env): bruk betalingssimulator
  redirect(`/public/tours/orders/payment/simulator?ref=${ref}`);
}

// --- Venteliste (offentlig) ---

export type JoinWaitlistInput = WaitlistInput;

export type JoinWaitlistResult =
  | { success: true; position: number }
  | { success: false; error: string };

/**
 * Registrer én person på venteliste for en tur.
 * Lagrer kun bookingen (status venteliste, beløp 0, type tur).
 */
export async function joinWaitlistFromPublic(
  input: JoinWaitlistInput,
): Promise<JoinWaitlistResult> {
  const parsed = waitlistSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.flatten().formErrors[0] ??
        "Ugyldig skjemadata for venteliste.",
    };
  }

  const { tourId, name, email } = parsed.data;

  const supabase = await createClient();

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("title")
    .eq("id", tourId)
    .eq("status", "published")
    .single();

  if (tourError || !tour) {
    return {
      success: false,
      error: "Kunne ikke finne turen. Vennligst prøv igjen senere.",
    };
  }

  const dato = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const status: BookingStatus = "venteliste";
  const type: BookingType = "tur";

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      navn: name.trim(),
      epost: email.trim(),
      dato,
      status,
      belop: 0,
      type,
      tour_id: tourId,
      telefon: "", // Empty string for waitlist since telefon is not collected
      notater: "Venteliste (offentlig registrering)",
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    return {
      success: false,
      error:
        bookingError.message ??
        "Kunne ikke legge deg til på ventelisten. Vennligst prøv igjen senere.",
    };
  }

  const waitlist = await getWaitlistForTour(supabase, tourId);
  if (!waitlist.success) {
    return { success: false, error: waitlist.error };
  }

  const index = waitlist.bookings.findIndex((b) => b.id === booking.id);
  const position = index >= 0 ? index + 1 : waitlist.bookings.length;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const bookingUrl = baseUrl
    ? `${baseUrl}/public/tours/${tourId}/bestill`
    : null;

  if (bookingUrl) {
    const joinedSubject = `Bekreftelse på venteliste: ${tour.title}`;
    const joinedHtml = `
      <p>Hei ${name.trim()},</p>
      <p>Du er nå lagt til på ventelisten for <strong>${tour.title}</strong>.</p>
      <p>Din plass i køen er <strong>#${position}</strong>.</p>
      <p>Vi sender deg e-post når du er først i køen.</p>
      <p><a href="${bookingUrl}">Gå til bestillingssiden</a></p>
    `;

    try {
      await sendEmail(email.trim(), joinedSubject, joinedHtml);

      if (position === 1) {
        const firstSubject = `Du er først i køen: ${tour.title}`;
        const firstHtml = `
          <p>Hei ${name.trim()},</p>
          <p>Du er nå <strong>først i køen</strong> for <strong>${tour.title}</strong>.</p>
          <p>Du kan bestille manuelt her:</p>
          <p><a href="${bookingUrl}">Gå til bestillingssiden</a></p>
        `;
        await sendEmail(email.trim(), firstSubject, firstHtml);
      }
    } catch {
      // Do not fail waitlist join if email sending fails.
    }
  }

  return { success: true, position };
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

  const betaltBelop =
    data.status === "delvis_betalt" && data.betalt_belop != null
      ? data.betalt_belop
      : null;

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      navn: data.navn.trim(),
      epost: data.epost.trim(),
      dato: datoStr,
      status: data.status,
      belop: data.belop,
      betalt_belop: betaltBelop,
      type: data.type ?? "tur",
      tour_id: data.tour_id ?? null,
      telefon: data.telefon.trim(),
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
