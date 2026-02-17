"use server";

import { createClient } from "@/lib/supabase/supabase-server";
import { isAllowedAdminResetEmail } from "@/lib/auth/adminResetConfig";

type ResetResult = {
  error?: string;
  field?: "email" | null;
};

export async function requestPasswordReset(
  formData: FormData,
): Promise<ResetResult> {
  const rawEmail = (formData.get("email") as string | null) ?? "";
  const email = rawEmail.trim();

  if (!email) {
    return {
      error: "Skriv inn e-postadressen din.",
      field: "email",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      error: "Skriv e-post i formatet navn@firma.no.",
      field: "email",
    };
  }

  if (!isAllowedAdminResetEmail(email)) {
    return {
      error:
        "Denne e-postadressen har ikke tilgang til administrasjon. Kontakt administrator hvis du mener dette er feil.",
      field: "email",
    };
  }

  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm`,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    return {
      error: "Noe gikk galt ved sending av e-post. Prøv igjen senere.",
      field: null,
    };
  }

  return {};
}
