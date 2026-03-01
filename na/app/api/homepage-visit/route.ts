import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  const hasRecentVisit = cookieHeader.includes("homepage_visit=1");

  if (hasRecentVisit) {
    return NextResponse.json({ success: true, skipped: true });
  }

  const supabase = await createClient();

  const sessionId = crypto.randomUUID();

  const { error } = await supabase.from("homepage_visits").insert({
    session_id: sessionId,
  });

  if (error) {
    console.error("Error inserting homepage visit:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("homepage_visit", "1", {
    maxAge: 60 * 30, // 30 minutter
    path: "/",
  });

  return response;
}
