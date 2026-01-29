"use server";

import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/supabase-server";
import { createTourSchema, updateTourSchema } from "@/lib/zod/tourValidation";
import type { TablesInsert, TablesUpdate } from "@/lib/database.types";

type TourInsert = TablesInsert<"tours">;
type TourUpdate = TablesUpdate<"tours">;

export async function getTours() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) {
    return { success: false as const, error: error.message, data: null };
  }
  return { success: true as const, data, error: null };
}

function extractFirstErrorMessage(error: unknown): string {
  if (error instanceof ZodError && error.issues.length > 0) {
    const firstIssue = error.issues[0];
    if (typeof firstIssue?.message === "string") {
      return firstIssue.message;
    }
  }

  return "Ugyldige data. Vennligst sjekk feltene og prøv igjen.";
}

function mapCreateInputToInsert(
  input: Required<{
    title: string;
    description: string | null | undefined;
    price: number;
    start_date: Date;
    end_date: Date | null | undefined;
    seats_available: number;
    image_url: string | null | undefined;
    status: TourInsert["status"];
  }>,
): TourInsert {
  return {
    title: input.title,
    description: input.description ?? null,
    price: input.price,
    start_date: input.start_date.toISOString(),
    end_date: input.end_date ? input.end_date.toISOString() : null,
    seats_available: input.seats_available,
    image_url: input.image_url ?? null,
    status: input.status,
  };
}

function mapUpdateInputToUpdate(
  input: Partial<{
    title: string;
    description: string | null | undefined;
    price: number;
    start_date: Date;
    end_date: Date | null | undefined;
    seats_available: number;
    image_url: string | null | undefined;
    status: TourUpdate["status"];
  }>,
): TourUpdate {
  const update: TourUpdate = {};

  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.price !== undefined) update.price = input.price;
  if (input.start_date !== undefined)
    update.start_date = input.start_date.toISOString();
  if (input.end_date !== undefined)
    update.end_date = input.end_date ? input.end_date.toISOString() : null;
  if (input.seats_available !== undefined)
    update.seats_available = input.seats_available;
  if (input.image_url !== undefined) update.image_url = input.image_url;
  if (input.status !== undefined) update.status = input.status;

  return update;
}

export async function createTour(formData: FormData) {
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    seats_available: formData.get("seats_available"),
    image_url: formData.get("image_url"),
    status: formData.get("status") ?? undefined,
  };

  const parsed = createTourSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      error: extractFirstErrorMessage(parsed.error),
    };
  }

  const supabase = await createClient();

  const insertPayload = mapCreateInputToInsert({
    description: parsed.data.description ?? null,
    end_date: parsed.data.end_date ?? null,
    image_url: parsed.data.image_url ?? null,
    price: parsed.data.price,
    seats_available: parsed.data.seats_available,
    start_date: parsed.data.start_date,
    status: parsed.data.status,
    title: parsed.data.title,
  });

  const { error } = await supabase.from("tours").insert(insertPayload);

  if (error) {
    return {
      success: false as const,
      error:
        "Kunne ikke opprette tur. Vennligst prøv igjen senere eller kontakt administrator.",
    };
  }

  return {
    success: true as const,
  };
}

export async function updateTour(formData: FormData) {
  const rawData = {
    id: formData.get("id"),
    title: formData.get("title") ?? undefined,
    description: formData.get("description") ?? undefined,
    price: formData.get("price") ?? undefined,
    start_date: formData.get("start_date") ?? undefined,
    end_date: formData.get("end_date") ?? undefined,
    seats_available: formData.get("seats_available") ?? undefined,
    image_url: formData.get("image_url") ?? undefined,
    status: formData.get("status") ?? undefined,
  };

  const parsed = updateTourSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      error: extractFirstErrorMessage(parsed.error),
    };
  }

  const { id, ...rest } = parsed.data;
  const updatePayload = mapUpdateInputToUpdate(rest);

  if (Object.keys(updatePayload).length === 0) {
    return {
      success: false as const,
      error: "Ingen felt å oppdatere.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("tours")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return {
      success: false as const,
      error:
        "Kunne ikke oppdatere tur. Vennligst prøv igjen senere eller kontakt administrator.",
    };
  }

  return {
    success: true as const,
  };
}

export async function deleteTour(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return {
      success: false as const,
      error: "Ugyldig tur-id.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("tours").delete().eq("id", id);

  if (error) {
    return {
      success: false as const,
      error:
        "Kunne ikke slette tur. Vennligst prøv igjen senere eller kontakt administrator.",
    };
  }

  return {
    success: true as const,
  };
}
