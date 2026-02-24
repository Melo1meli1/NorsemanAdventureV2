"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/supabase-server";
import { createNewsSchema, updateNewsSchema } from "@/lib/zod/newsValidation";
import type { News } from "@/lib/types/news";

function extractFirstErrorMessage(error: unknown): string {
  if (error instanceof ZodError && error.issues.length > 0) {
    const firstIssue = error.issues[0];
    if (typeof firstIssue?.message === "string") {
      return firstIssue.message;
    }
  }
  return "Ugyldige data. Vennligst sjekk feltene og prøv igjen.";
}

export async function getNews(): Promise<
  | { success: true; data: News[]; error: null }
  | { success: false; data: null; error: string }
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message, data: null };
  }
  return { success: true, data: data as News[], error: null };
}

export async function createNews(formData: FormData) {
  const rawData = {
    title: formData.get("title"),
    short_description: formData.get("short_description") ?? "",
    content: formData.get("content") ?? "",
    image_url: formData.get("image_url") ?? "",
    status: formData.get("status") ?? "draft",
    published_at: formData.get("published_at") || null,
  };

  const parsed = createNewsSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      error: extractFirstErrorMessage(parsed.error),
    };
  }

  const supabase = await createClient();

  const insertPayload = {
    title: parsed.data.title,
    short_description: parsed.data.short_description || null,
    content: parsed.data.content || null,
    image_url: parsed.data.image_url || null,
    status: parsed.data.status,
    published_at: parsed.data.published_at
      ? parsed.data.published_at.toISOString()
      : null,
  };

  const { error } = await supabase.from("news").insert(insertPayload);

  if (error) {
    return {
      success: false as const,
      error:
        "Kunne ikke opprette nyhet. Vennligst prøv igjen senere eller kontakt administrator.",
    };
  }

  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function updateNews(formData: FormData) {
  const rawData = {
    id: formData.get("id"),
    title: formData.get("title") ?? undefined,
    short_description: formData.get("short_description") ?? undefined,
    content: formData.get("content") ?? undefined,
    image_url: formData.get("image_url") ?? undefined,
    status: formData.get("status") ?? undefined,
    published_at: formData.get("published_at") || null,
  };

  const parsed = updateNewsSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false as const,
      error: extractFirstErrorMessage(parsed.error),
    };
  }

  const { id, ...rest } = parsed.data;

  const updatePayload: Record<string, unknown> = {};
  if (rest.title !== undefined) updatePayload.title = rest.title;
  if (rest.short_description !== undefined)
    updatePayload.short_description = rest.short_description || null;
  if (rest.content !== undefined) updatePayload.content = rest.content || null;
  if (rest.image_url !== undefined)
    updatePayload.image_url = rest.image_url || null;
  if (rest.status !== undefined) updatePayload.status = rest.status;
  if (rest.published_at !== undefined)
    updatePayload.published_at = rest.published_at
      ? rest.published_at.toISOString()
      : null;

  if (Object.keys(updatePayload).length === 0) {
    return { success: false as const, error: "Ingen felt å oppdatere." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("news")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return {
      success: false as const,
      error:
        "Kunne ikke oppdatere nyhet. Vennligst prøv igjen senere eller kontakt administrator.",
    };
  }

  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function deleteNews(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return { success: false as const, error: "Ugyldig nyhets-id." };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) {
    return {
      success: false as const,
      error:
        "Kunne ikke slette nyhet. Vennligst prøv igjen senere eller kontakt administrator.",
    };
  }

  revalidatePath("/admin/dashboard");
  return { success: true as const };
}
