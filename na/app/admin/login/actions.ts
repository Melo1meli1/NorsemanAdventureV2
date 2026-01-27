"use server";

import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validation
  if (!email || !password) {
    return {
      error: "E-post og passord er påkrevd.",
      field: null as "email" | "password" | null,
    };
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      error: "Ugyldig e-postformat.",
      field: "email" as const,
    };
  }

  // Supabase authentication
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMessage = "Feil brukernavn eller passord.";

    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Feil brukernavn eller passord.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "E-postadressen er ikke bekreftet.";
    }

    return {
      error: errorMessage,
      field: null as "email" | "password" | null,
    };
  }

  // Success - redirect to dashboard
  if (data.user) {
    redirect("/admin/dashboard");
  }

  return {
    error: "Noe gikk galt. Prøv igjen.",
    field: null as "email" | "password" | null,
  };
}
