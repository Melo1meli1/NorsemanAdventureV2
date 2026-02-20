import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { promoteWaitlistOnceForTour } from "@/lib/waitlist/promoteWaitlist";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? null;
  const result = await promoteWaitlistOnceForTour({
    supabase,
    tourId: id,
    siteUrl,
  });

  if (!result.promoted) {
    if (result.reason === "no_remaining_seats") {
      return NextResponse.json(
        { promoted: false, reason: "Ingen ledige plasser på turen." },
        { status: 200 },
      );
    }

    if (result.reason === "no_waitlist") {
      return NextResponse.json(
        { promoted: false, reason: "Ingen på ventelisten for denne turen." },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { promoted: false, error: result.error ?? "Kunne ikke promotere." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      promoted: true,
      bookingId: result.promotedBookingId,
      notifiedNewFirst: result.notifiedNewFirst,
    },
    { status: 200 },
  );
}
