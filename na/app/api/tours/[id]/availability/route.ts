import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";
import { getRemainingSeatsForTour } from "@/lib/bookingUtils";

type RouteContext = {
  params: { id: string };
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = context.params;

  const supabase = await createClient();
  const availability = await getRemainingSeatsForTour(supabase, id);

  if (!availability.success) {
    return NextResponse.json({ error: availability.error }, { status: 400 });
  }

  return NextResponse.json({
    remainingSeats: availability.remainingSeats,
    totalSeats: availability.totalSeats,
    confirmedSeats: availability.confirmedSeats,
  });
}
