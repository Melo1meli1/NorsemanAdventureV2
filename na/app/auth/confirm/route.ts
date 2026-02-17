import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  if (!tokenHash || type !== "recovery") {
    return NextResponse.redirect(new URL("/admin/login", url.origin));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });

  if (error) {
    console.error("Error verifying recovery token:", error);
    return NextResponse.redirect(
      new URL("/admin/login?error=reset", url.origin),
    );
  }

  // Etter vellykket verifisering får brukeren en midlertidig session,
  // så vi kan sende dem til siden for å sette nytt passord.
  return NextResponse.redirect(
    new URL("/admin/login/reset-password", url.origin),
  );
}
