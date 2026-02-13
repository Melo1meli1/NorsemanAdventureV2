import { createClient } from "@/lib/supabase/supabase-server";
import { getAllPublicGalleryImages } from "@/app/admin/dashboard/actions/gallery";
import { getPublicGalleryImageUrl } from "@/lib/galleryPublic";
import { GalleryPageClient } from "./GalleryPageClient";

export default async function GalleriPage() {
  const supabase = await createClient();
  const { data: tours } = await supabase
    .from("tours")
    .select("id, title")
    .eq("status", "published")
    .order("title", { ascending: true });

  const { success, data: galleryRows } = await getAllPublicGalleryImages();
  const images =
    success && galleryRows
      ? galleryRows.map((row) => ({
          id: row.id,
          file_path: row.file_path,
          url: getPublicGalleryImageUrl(row.file_path),
          tour_id: row.tour_id,
        }))
      : [];

  return (
    <main className="bg-background min-h-screen">
      <GalleryPageClient images={images} tours={tours ?? []} />
    </main>
  );
}
