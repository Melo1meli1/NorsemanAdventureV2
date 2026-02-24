"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-server";
import {
  subscribeSchema,
  unsubscribeSchema,
} from "@/lib/zod/subscriberValidation";
import type { Subscriber } from "@/lib/types/subscriber";

function extractFirstZodError(error: {
  issues: { message: string }[];
}): string {
  return (
    error.issues[0]?.message ??
    "Ugyldige data. Vennligst sjekk feltene og prøv igjen."
  );
}

export async function subscribeToNewsletter(email: string) {
  const parsed = subscribeSchema.safeParse({ email });

  if (!parsed.success) {
    return {
      success: false as const,
      error: extractFirstZodError(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscribers")
    .insert({ email: parsed.data.email.toLowerCase(), status: "active" });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false as const,
        error: "Denne e-postadressen er allerede registrert",
      };
    }
    return {
      success: false as const,
      error: "Kunne ikke registrere abonnement. Vennligst prøv igjen.",
    };
  }

  return { success: true as const };
}

export async function unsubscribeFromNewsletter(formData: FormData) {
  const email = formData.get("email") as string;
  const parsed = unsubscribeSchema.safeParse({ email });

  if (!parsed.success) {
    redirect(
      `/unsubscribe?error=${encodeURIComponent(extractFirstZodError(parsed.error))}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("email", parsed.data.email.toLowerCase())
    .eq("status", "active");

  if (error) {
    redirect(
      `/unsubscribe?error=${encodeURIComponent("Kunne ikke fjerne abonnement. Vennligst prøv igjen.")}`,
    );
  }

  redirect("/unsubscribe/success");
}

export async function getActiveSubscribers(): Promise<
  | { success: true; data: Subscriber[]; error: null }
  | { success: false; data: null; error: string }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .eq("status", "active")
    .order("subscribed_at", { ascending: true });

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  return { success: true, data: data as Subscriber[], error: null };
}

export async function getSubscriberStats(): Promise<
  | { success: true; data: { active: number; total: number }; error: null }
  | { success: false; data: null; error: string }
> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("subscribers").select("status");

  if (error) {
    return { success: false, error: error.message, data: null };
  }

  const total = data.length;
  const active = data.filter((s) => s.status === "active").length;

  return { success: true, data: { active, total }, error: null };
}
