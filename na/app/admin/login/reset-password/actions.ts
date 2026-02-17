"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";

type UpdatePasswordResult = {
  error?: string;
};

export async function updatePassword(
  formData: FormData,
): Promise<UpdatePasswordResult> {
  const newPassword = (formData.get("newPassword") as string | null) ?? "";

  if (!newPassword || newPassword.length < 8) {
    return {
      error: "Passordet må være minst 8 tegn.",
    };
  }

  const supabase = await createClient();

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return {
      error:
        "Ingen gyldig tilbakestillingsøkt funnet. Bruk lenken i e-posten på nytt.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error("Failed to update password:", error);
    return {
      error: "Noe gikk galt da vi prøvde å oppdatere passordet. Prøv igjen.",
    };
  }

  // Logg ut brukeren fra recovery-session og send dem til login
  await supabase.auth.signOut();

  redirect("/admin/login?reset=success");
}

