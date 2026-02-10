import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getRemainingSeatsForTour } from "@/lib/bookingUtils";
import type { Database } from "@/lib/database.types";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error(
        "[letsreg webhook] Mangler NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY",
      );
      return NextResponse.json(
        { error: "Server miskonfigurert" },
        { status: 503 },
      );
    }

    const payload = await request.json();
    const referenceId = payload?.reference_id ?? payload?.referenceId ?? null;

    if (!referenceId || typeof referenceId !== "string") {
      return NextResponse.json(
        { error: "Mangler reference_id" },
        { status: 400 },
      );
    }

    const supabaseAdmin: SupabaseClient<Database> = createClient(
      supabaseUrl,
      serviceRoleKey,
    );

    if (payload.status === "COMPLETED") {
      const { data: booking, error } = await supabaseAdmin
        .from("bookings")
        .update({ status: "betalt" })
        .eq("id", referenceId)
        .select("tour_id")
        .single();

      if (error) {
        console.error(
          "[letsreg webhook] Booking update feilet:",
          error.message,
        );
        return NextResponse.json(
          { error: "Kunne ikke oppdatere bestilling" },
          { status: 500 },
        );
      }

      if (booking?.tour_id) {
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
  } catch (err) {
    console.error("[letsreg webhook] Uventet feil:", err);
    return NextResponse.json(
      { error: "En intern feil oppstod" },
      { status: 500 },
    );
  }
}
