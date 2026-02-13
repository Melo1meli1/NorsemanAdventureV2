const BUCKET = "tours-gallery";

/**
 * Bygger offentlig URL for et bilde i tours-gallery-bucket.
 * Brukes på server (page) og kan brukes på client.
 */
export function getPublicGalleryImageUrl(filePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  return `${base}/storage/v1/object/public/${BUCKET}/${filePath}`;
}
