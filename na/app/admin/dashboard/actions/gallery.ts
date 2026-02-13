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

/** Henter alle galleri-only bilder (uten tur). Til bruk for opplasting til _gallery. */
export async function getGalleryOnlyImages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_gallery_images")
    .select("id, file_path")
    .is("tour_id", null)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false as const, error: error.message, data: [] };
  }
  return { success: true as const, data: data ?? [], error: null };
}

/** Henter alle bilder som er i offentlig galleri (sannhetskilden for den offentlige siden). */
export async function getAllPublicGalleryImages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_gallery_images")
    .select("id, file_path, tour_id, tours(title)")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false as const, error: error.message, data: [] };
  }
  const rows = data ?? [];
  return {
    success: true as const,
    data: rows.map(
      (row: {
        id: string;
        file_path: string;
        tour_id: string | null;
        tours?: { title: string }[] | { title: string } | null;
      }) => ({
        id: row.id,
        file_path: row.file_path,
        tour_id: row.tour_id,
        tour_title: Array.isArray(row.tours)
          ? (row.tours[0]?.title ?? null)
          : ((row.tours as { title: string } | null)?.title ?? null),
      }),
    ),
    error: null,
  };
}

/** Legger et galleri-only bilde i offentlig galleri. file_path må starte med "_gallery/". */
export async function addGalleryOnlyToPublicGallery(filePath: string) {
  if (!filePath.startsWith("_gallery/")) {
    return {
      success: false as const,
      error: "file_path må starte med _gallery/",
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("public_gallery_images").insert({
    tour_id: null,
    file_path: filePath,
  });

  if (error) {
    return { success: false as const, error: error.message };
  }
  return { success: true as const, error: null };
}
