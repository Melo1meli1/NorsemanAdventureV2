import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { sendEmail } from "@/lib/mail";
import { buildFirstInLineEmail } from "@/lib/norsemanEmailTemplates";
import {
  getFirstWaitlistEntryForTour,
  getRemainingSeatsForTour,
} from "@/lib/bookingUtils";

export type PromoteWaitlistOnceResult =
  | {
      promoted: true;
      promotedBookingId: string;
      notifiedNewFirst: boolean;
      remainingSeatsAfter?: number;
    }
  | {
      promoted: false;
      reason:
        | "no_remaining_seats"
        | "no_waitlist"
        | "availability_error"
        | "update_error";
      error?: string;
    };

export async function promoteWaitlistOnceForTour(input: {
  supabase: SupabaseClient<Database>;
  tourId: string;
  siteUrl?: string | null;
}): Promise<PromoteWaitlistOnceResult> {
  const { supabase, tourId, siteUrl } = input;

  const availability = await getRemainingSeatsForTour(supabase, tourId);
  if (!availability.success) {
    return {
      promoted: false,
      reason: "availability_error",
      error: availability.error,
    };
  }

  if (availability.remainingSeats <= 0) {
    return { promoted: false, reason: "no_remaining_seats" };
  }

  const firstResult = await getFirstWaitlistEntryForTour(supabase, tourId);
  if (!firstResult.success) {
    return {
      promoted: false,
      reason: "availability_error",
      error: firstResult.error,
    };
  }

  const booking = firstResult.booking;
  if (!booking) {
    return { promoted: false, reason: "no_waitlist" };
  }

  const { data: tour } = await supabase
    .from("tours")
    .select("title")
    .eq("id", tourId)
    .single();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "ikke_betalt",
      reservation_expires_at: expiresAt.toISOString(),
      reservation_notified_at: now.toISOString(),
    })
    .eq("id", booking.id);

  if (updateError) {
    return {
      promoted: false,
      reason: "update_error",
      error: updateError.message ?? "Kunne ikke flytte booking fra venteliste.",
    };
  }

  const updatedAvailability = await getRemainingSeatsForTour(supabase, tourId);
  if (updatedAvailability.success) {
    await supabase
      .from("tours")
      .update({ seats_available: updatedAvailability.remainingSeats })
      .eq("id", tourId);
  }

  const bookingUrl = siteUrl
    ? `${siteUrl}/public/tours/${tourId}/bestill`
    : null;

  let notifiedNewFirst = false;
  if (tour?.title && bookingUrl) {
    const { subject, html } = buildFirstInLineEmail({
      siteUrl,
      name: booking.navn,
      tourTitle: tour.title,
      bookingUrl,
    });

    try {
      await sendEmail(booking.epost, subject, html);
      notifiedNewFirst = true;
    } catch {
      // ignore
    }
  }

  return {
    promoted: true,
    promotedBookingId: booking.id,
    notifiedNewFirst,
    remainingSeatsAfter: updatedAvailability.success
      ? updatedAvailability.remainingSeats
      : undefined,
  };
}
