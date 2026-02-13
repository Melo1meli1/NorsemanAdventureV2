"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ImageLightbox } from "./ImageLightbox";

const IMAGES_PER_PAGE = 9;

export type GalleryImage = {
  id: string;
  file_path: string;
  url: string;
  tour_id: string | null;
};

type GalleryGridProps = {
  images: GalleryImage[];
};

export function GalleryGrid({ images }: GalleryGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const totalPages = Math.max(1, Math.ceil(images.length / IMAGES_PER_PAGE));
  const paginatedImages = useMemo(() => {
    const start = (currentPage - 1) * IMAGES_PER_PAGE;
    return images.slice(start, start + IMAGES_PER_PAGE);
  }, [images, currentPage]);

  if (images.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center">
        Ingen bilder i galleriet ennå.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {paginatedImages.map((img) => (
          <button
            type="button"
            key={img.id}
            className="group focus-visible:ring-ring focus-visible:ring-offset-background relative aspect-[5/4] w-full overflow-hidden rounded-xl bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            onClick={() => setLightboxImage(img)}
          >
            <Image
              src={img.url}
              alt=""
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            />
            <span
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white">
                <ZoomIn className="h-7 w-7" aria-hidden />
              </span>
            </span>
          </button>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        hasNextPage={currentPage < totalPages}
      />

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.url}
          alt=""
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}
