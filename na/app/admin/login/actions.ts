"use server";

import { createClient } from "@/lib/supabase/supabase-server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      error: "E-post og passord er påkrevd.",
      field: null as "email" | "password" | null,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      error: "Ugyldig e-postformat.",
      field: "email" as const,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMessage = "Feil e-post eller passord. Sjekk at begge er riktige.";

    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Feil e-post eller passord. Sjekk at begge er riktige.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "E-postadressen er ikke bekreftet.";
    }

    return {
      error: errorMessage,
      field: null as "email" | "password" | null,
    };
  }

  if (data.user) {
    redirect("/admin/dashboard");
  }

  return {
    error: "Noe gikk galt. Prøv igjen.",
    field: null as "email" | "password" | null,
  };
}
