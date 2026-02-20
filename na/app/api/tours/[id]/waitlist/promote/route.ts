import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { sendEmail } from "@/lib/mail";
import {
  getFirstWaitlistEntryForTour,
  getRemainingSeatsForTour,
} from "@/lib/bookingUtils";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const supabase = await createClient();

  // Sjekk om det finnes ledige plasser.
  const availability = await getRemainingSeatsForTour(supabase, id);
  if (!availability.success) {
    return NextResponse.json(
      { promoted: false, error: availability.error },
      { status: 400 },
    );
  }

  if (availability.remainingSeats <= 0) {
    return NextResponse.json(
      {
        promoted: false,
        reason: "Ingen ledige plasser på turen.",
      },
      { status: 200 },
    );
  }

  // Finn første i venteliste-køen for turen.
  const firstResult = await getFirstWaitlistEntryForTour(supabase, id);
  if (!firstResult.success) {
    return NextResponse.json(
      { promoted: false, error: firstResult.error },
      { status: 400 },
    );
  }

  const booking = firstResult.booking;
  if (!booking) {
    return NextResponse.json(
      {
        promoted: false,
        reason: "Ingen på ventelisten for denne turen.",
      },
      { status: 200 },
    );
  }

  const { data: tour } = await supabase
    .from("tours")
    .select("title")
    .eq("id", id)
    .single();

  // Oppdater status fra venteliste til ikke_betalt (klar til videre prosess).
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status: "ikke_betalt" })
    .eq("id", booking.id);

  if (updateError) {
    return NextResponse.json(
      {
        promoted: false,
        error:
          updateError.message ??
          "Kunne ikke flytte bruker fra venteliste til aktiv plass.",
      },
      { status: 500 },
    );
  }

  // Re-beregn availability og oppdater seats_available slik som i webhooken.
  const updatedAvailability = await getRemainingSeatsForTour(supabase, id);
  if (updatedAvailability.success) {
    await supabase
      .from("tours")
      .update({ seats_available: updatedAvailability.remainingSeats })
      .eq("id", id);
  }

  const nextFirst = await getFirstWaitlistEntryForTour(supabase, id);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const bookingUrl = baseUrl ? `${baseUrl}/public/tours/${id}/bestill` : null;

  if (nextFirst.success && nextFirst.booking && tour?.title && bookingUrl) {
    const subject = `Du er først i køen: ${tour.title}`;
    const html = `
      <p>Hei ${nextFirst.booking.navn},</p>
      <p>Du er nå <strong>først i køen</strong> for <strong>${tour.title}</strong>.</p>
      <p>Du kan bestille manuelt her:</p>
      <p><a href="${bookingUrl}">Gå til bestillingssiden</a></p>
    `;

    try {
      await sendEmail(nextFirst.booking.epost, subject, html);
    } catch {
      // Do not fail promote if email sending fails.
    }
  }

  return NextResponse.json(
    {
      promoted: true,
      bookingId: booking.id,
      navn: booking.navn,
      epost: booking.epost,
    },
    { status: 200 },
  );
}
