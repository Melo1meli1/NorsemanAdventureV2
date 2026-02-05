import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  if (payload.status === "COMPLETED") {
    await supabaseAdmin
      .from("bookings")
      .update({ status: "betalt" })
      .eq("id", payload.reference_id);
  }

  return NextResponse.json({ received: true });
}
