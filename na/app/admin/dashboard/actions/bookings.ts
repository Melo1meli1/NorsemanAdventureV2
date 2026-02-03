"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/supabase-server";

export async function deleteBooking(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return {
      success: false as const,
      error: "Ugyldig booking-id.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    return {
      success: false as const,
      error:
        "Kunne ikke slette bestilling. Vennligst prøv igjen senere eller kontakt administrator.",
    };
  }

  //note: bookings have cascaade turned on, participants will be automatically delete.

  revalidatePath("/admin/dashboard/orders");
  return {
    success: true as const,
  };
}
