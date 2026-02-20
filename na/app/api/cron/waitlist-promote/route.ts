import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/supabase-admin";
import { promoteWaitlistOnceForTour } from "@/lib/waitlist/promoteWaitlist";
import { getRemainingSeatsForTours } from "@/lib/bookingUtils";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const url = new URL(request.url);

  // Vercel Cron sends this header. Using it allows scheduled execution without
  // embedding secrets in the cron path.
  if (request.headers.get("x-vercel-cron") === "1") return true;

  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const cronHeader = request.headers.get("x-cron-secret");
  if (cronHeader === secret) return true;

  const querySecret = url.searchParams.get("secret");
  if (querySecret === secret) return true;

  return false;
}

async function runCron(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? null;
  const supabase = createAdminClient();

  const nowIso = new Date().toISOString();

  const { data: expiredReservations, error: expiredError } = await supabase
    .from("bookings")
    .select("id, tour_id")
    .eq("status", "ikke_betalt")
    .eq("belop", 0)
    .not("tour_id", "is", null)
    .lt("reservation_expires_at", nowIso)
    .limit(1000);

  if (expiredError) {
    return NextResponse.json(
      {
        error: expiredError.message ?? "Kunne ikke hente utløpte reservasjoner",
      },
      { status: 500 },
    );
  }

  const expiredIds = (expiredReservations ?? []).map(
    (r) => (r as { id: string }).id,
  );
  const expiredTourIds = Array.from(
    new Set(
      (expiredReservations ?? []).map(
        (r) => (r as { tour_id: string }).tour_id,
      ),
    ),
  ).filter(Boolean);

  if (expiredIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .in("id", expiredIds);

    if (deleteError) {
      return NextResponse.json(
        {
          error:
            deleteError.message ?? "Kunne ikke slette utløpte reservasjoner",
        },
        { status: 500 },
      );
    }

    const remainingByTourId = await getRemainingSeatsForTours(
      supabase,
      expiredTourIds,
    );

    await Promise.all(
      expiredTourIds.map((tourId) =>
        supabase
          .from("tours")
          .update({ seats_available: remainingByTourId.get(tourId) ?? 0 })
          .eq("id", tourId),
      ),
    );
  }

  const { data: waitlistRows, error: waitlistError } = await supabase
    .from("bookings")
    .select("tour_id")
    .eq("status", "venteliste")
    .not("tour_id", "is", null)
    .limit(1000);

  if (waitlistError) {
    return NextResponse.json(
      { error: waitlistError.message ?? "Kunne ikke hente venteliste" },
      { status: 500 },
    );
  }

  const tourIds = Array.from(
    new Set(
      (waitlistRows ?? []).map((r) => (r as { tour_id: string }).tour_id),
    ),
  ).filter(Boolean);

  for (const t of expiredTourIds) {
    if (!tourIds.includes(t)) tourIds.push(t);
  }

  const perTour: Array<{ tourId: string; promoted: number }> = [];
  let totalPromoted = 0;

  for (const tourId of tourIds) {
    let promotedForTour = 0;

    // Promote until no seats or no waitlist. Hard cap to avoid infinite loops.
    for (let i = 0; i < 50; i++) {
      const result = await promoteWaitlistOnceForTour({
        supabase,
        tourId,
        siteUrl,
      });

      if (!result.promoted) break;

      promotedForTour += 1;
      totalPromoted += 1;
    }

    if (promotedForTour > 0) {
      perTour.push({ tourId, promoted: promotedForTour });
    }
  }

  return NextResponse.json({
    ok: true,
    expiredReservationsDeleted: expiredIds.length,
    totalPromoted,
    toursTouched: perTour.length,
    perTour,
  });
}

export async function POST(request: Request) {
  return runCron(request);
}

export async function GET(request: Request) {
  return runCron(request);
}
