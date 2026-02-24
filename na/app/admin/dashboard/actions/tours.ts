"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/supabase-server";
import {
  createTourSchema,
  createDraftTourSchema,
  updateTourSchema,
  updateDraftTourSchema,
} from "@/lib/zod/tourValidation";
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
    short_description: string | null | undefined;
    long_description: string | null | undefined;
    hoydepunkter: string | null | undefined;
    sted: string | null | undefined;
    vanskelighetsgrad: TourInsert["vanskelighetsgrad"];
    terreng: TourInsert["terreng"];
    price: number;
    start_date: Date;
    end_date: Date | null | undefined;
    seats_available: number;
    total_seats: number;
    image_url: string | null | undefined;
    status: TourInsert["status"];
  }>,
): TourInsert {
  return {
    title: input.title,
    short_description: input.short_description ?? null,
    long_description: input.long_description ?? null,
    hoydepunkter: input.hoydepunkter ?? null,
    sted: input.sted ?? null,
    vanskelighetsgrad: input.vanskelighetsgrad ?? null,
    terreng: input.terreng ?? null,
    price: input.price,
    start_date: input.start_date.toISOString(),
    end_date: input.end_date ? input.end_date.toISOString() : null,
    seats_available: input.seats_available,
    total_seats: input.total_seats,
    image_url: input.image_url ?? null,
    status: input.status,
  };
}

function mapUpdateInputToUpdate(
  input: Partial<{
    title: string;
    short_description: string | null | undefined;
    long_description: string | null | undefined;
    hoydepunkter: string | null | undefined;
    sted: string | null | undefined;
    vanskelighetsgrad: TourUpdate["vanskelighetsgrad"];
    terreng: TourUpdate["terreng"];
    price: number;
    start_date: Date;
    end_date: Date | null | undefined;
    seats_available: number;
    total_seats: number;
    image_url: string | null | undefined;
    status: TourUpdate["status"];
  }>,
): TourUpdate {
  const update: TourUpdate = {};

  if (input.title !== undefined) update.title = input.title;
  if (input.short_description !== undefined)
    update.short_description = input.short_description;
  if (input.long_description !== undefined)
    update.long_description = input.long_description;
  if (input.hoydepunkter !== undefined)
    update.hoydepunkter = input.hoydepunkter;
  if (input.sted !== undefined) update.sted = input.sted;
  if (input.vanskelighetsgrad !== undefined)
    update.vanskelighetsgrad = input.vanskelighetsgrad;
  if (input.terreng !== undefined) update.terreng = input.terreng;
  if (input.price !== undefined) update.price = input.price;
  if (input.start_date !== undefined)
    update.start_date = input.start_date.toISOString();
  if (input.end_date !== undefined)
    update.end_date = input.end_date ? input.end_date.toISOString() : null;
  if (input.seats_available !== undefined)
    update.seats_available = input.seats_available;
  if (input.total_seats !== undefined) update.total_seats = input.total_seats;
  if (input.image_url !== undefined) update.image_url = input.image_url;
  if (input.status !== undefined) update.status = input.status;

  return update;
}

export async function createTour(formData: FormData) {
  const rawData = {
    title: formData.get("title"),
    short_description: formData.get("short_description") ?? "",
    long_description: formData.get("long_description") ?? "",
    hoydepunkter: formData.get("hoydepunkter") ?? "",
    sted: formData.get("sted") ?? "",
    vanskelighetsgrad: formData.get("vanskelighetsgrad") ?? "",
    terreng: formData.get("terreng") ?? "",
    price: formData.get("price"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    seats_available: formData.get("seats_available"),
    total_seats: formData.get("total_seats"),
    image_url: formData.get("image_url"),
    status: formData.get("status") ?? undefined,
  };

  const isDraft = rawData.status === "draft" || !rawData.status;
  const schema = isDraft ? createDraftTourSchema : createTourSchema;
  const parsed = schema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      error: extractFirstErrorMessage(parsed.error),
    };
  }

  const supabase = await createClient();

  const d = parsed.data;
  const insertPayload = mapCreateInputToInsert({
    end_date: d.end_date ?? null,
    hoydepunkter: d.hoydepunkter ?? null,
    image_url: d.image_url ?? null,
    long_description: d.long_description ?? null,
    price: d.price ?? 0,
    seats_available: d.seats_available ?? 0,
    total_seats: d.total_seats ?? 0,
    sesong: (d.sesong ?? null) as TourInsert["sesong"],
    short_description: d.short_description ?? null,
    start_date: d.start_date ?? new Date(),
    sted: d.sted ?? null,
    status: d.status ?? "draft",
    terreng: (d.terreng ?? null) as TourInsert["terreng"],
    title: d.title ?? "",
    vanskelighetsgrad: (d.vanskelighetsgrad ??
      null) as TourInsert["vanskelighetsgrad"],
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
    short_description: formData.get("short_description") ?? undefined,
    long_description: formData.get("long_description") ?? undefined,
    hoydepunkter: formData.get("hoydepunkter") ?? undefined,
    sted: formData.get("sted") ?? undefined,
    vanskelighetsgrad: formData.get("vanskelighetsgrad") ?? undefined,
    sesong: formData.get("sesong") ?? undefined,
    terreng: formData.get("terreng") ?? undefined,
    price: formData.get("price") ?? undefined,
    start_date: formData.get("start_date") ?? undefined,
    end_date: formData.get("end_date") ?? undefined,
    seats_available: formData.get("seats_available") ?? undefined,
    total_seats: formData.get("total_seats") ?? undefined,
    image_url: formData.get("image_url") ?? undefined,
    status: formData.get("status") ?? undefined,
  };

  const isDraft = rawData.status === "draft" || !rawData.status;
  const schema = isDraft ? updateDraftTourSchema : updateTourSchema;
  const parsed = schema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      error: extractFirstErrorMessage(parsed.error),
    };
  }

  const { id, ...rest } = parsed.data;
  const updatePayload = mapUpdateInputToUpdate({
    ...rest,
    start_date: rest.start_date instanceof Date ? rest.start_date : undefined,
    vanskelighetsgrad: (rest.vanskelighetsgrad ??
      undefined) as TourUpdate["vanskelighetsgrad"],
    sesong: (rest.sesong ?? undefined) as TourUpdate["sesong"],
    terreng: (rest.terreng ?? undefined) as TourUpdate["terreng"],
  });

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

/**
 * Set the tour's cover/thumbnail image (image_url) to a gallery image URL.
 * Used from admin gallery: "Gjør hovedbilde" sets this image as the one shown on the homepage.
 */
export async function setTourCoverImage(
  tourId: string,
  imageUrl: string,
): Promise<{ success: true } | { success: false; error: string }> {
  if (!tourId || !imageUrl) {
    return { success: false, error: "Mangler tur-id eller bilde-URL." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tours")
    .update({ image_url: imageUrl })
    .eq("id", tourId);

  if (error) {
    return {
      success: false,
      error:
        "Kunne ikke sette hovedbilde. Vennligst prøv igjen eller kontakt administrator.",
    };
  }

  revalidatePath("/");
  revalidatePath("/public/tours");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function deleteTour(formData: FormData) {
  console.log("Deleting tour with formData:", formData);
  const id = formData.get("id");
  console.log("Deleting tour with ID:", id);

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

  revalidatePath("/admin/dashboard/tours");
  return {
    success: true as const,
  };
}
