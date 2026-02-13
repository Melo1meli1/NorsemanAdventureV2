"use server";

import { createClient } from "@/lib/supabase/supabase-server";

/** Returnerer file_path for alle bilder fra denne turen som er i offentlig galleri */
export async function getPublicGalleryFilePathsForTour(tourId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_gallery_images")
    .select("file_path")
    .eq("tour_id", tourId);

  if (error) {
    return { success: false as const, error: error.message, data: [] };
  }
  return {
    success: true as const,
    data: (data ?? []).map((row) => row.file_path),
    error: null,
  };
}

/** Legger et bilde (tur) inn i offentlig galleri. file_path f.eks. "tour-id/filnavn.webp" */
export async function addToPublicGallery(tourId: string, filePath: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("public_gallery_images").insert({
    tour_id: tourId,
    file_path: filePath,
  });

  if (error) {
    return { success: false as const, error: error.message };
  }
  return { success: true as const, error: null };
}

/** Fjerner et bilde fra offentlig galleri (uavhengig av tur). */
export async function removeFromPublicGallery(filePath: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("public_gallery_images")
    .delete()
    .eq("file_path", filePath);

  if (error) {
    return { success: false as const, error: error.message };
  }
  return { success: true as const, error: null };
}
