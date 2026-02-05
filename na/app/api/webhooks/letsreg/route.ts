import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getRemainingSeatsForTour } from "@/lib/bookingUtils";
import type { Database } from "@/lib/database.types";

export async function POST(request: Request) {
  const payload = await request.json();

  const supabaseAdmin: SupabaseClient<Database> = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  if (payload.status === "COMPLETED") {
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update({ status: "betalt" })
      .eq("id", payload.reference_id)
      .select("tour_id")
      .single();

    if (!error && booking?.tour_id) {
      const availability = await getRemainingSeatsForTour(
        supabaseAdmin,
        booking.tour_id,
      );

      if (availability.success) {
        await supabaseAdmin
          .from("tours")
          .update({ seats_available: availability.remainingSeats })
          .eq("id", booking.tour_id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
