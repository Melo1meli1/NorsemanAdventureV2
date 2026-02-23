"use server";

import { sendEmail } from "@/lib/mail";
import { createClient } from "@/lib/supabase/supabase-server";
import type { BookingStatus, BookingType } from "@/lib/types";

export async function joinWaitlistFromPublic(
  tourId: string,
  name: string,
  email: string,
) {
  const supabase = await createClient();

  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("title")
    .eq("id", tourId)
    .eq("status", "published")
    .single();

  if (tourError || !tour) {
    throw new Error("Kunne ikke finne turen.");
  }

  const dato = new Date().toISOString().slice(0, 10);
  const status: BookingStatus = "venteliste";
  const type: BookingType = "tur";

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      tour_id: tourId,
      navn: name.trim(),
      epost: email.trim(),
      dato,
      status,
      type,
      belop: 0,
      telefon: "",
      notater: "Venteliste (offentlig registrering)",
    })
    .select("id, created_at")
    .single();

  if (bookingError || !booking) throw new Error(bookingError?.message);

  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tour_id", tourId)
    .eq("status", "venteliste")
    .lte("created_at", booking.created_at);

  const position = count ?? 1;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const bookingUrl = baseUrl
    ? `${baseUrl}/public/tours/${tourId}/bestill`
    : null;

  if (bookingUrl) {
    await sendEmail(
      email.trim(),
      `Bekreftelse på venteliste: ${tour.title}`,
      `
        <p>Hei ${name.trim()},</p>
        <p>Du er nå lagt til på ventelisten for <strong>${tour.title}</strong>.</p>
        <p>Din plass i køen er <strong>#${position}</strong>.</p>
        <p><a href="${bookingUrl}">Gå til bestillingssiden</a></p>
      `,
    );
  }

  return { success: true, position };
}
