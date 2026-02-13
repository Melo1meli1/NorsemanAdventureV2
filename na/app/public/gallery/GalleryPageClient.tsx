"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { GalleryFilterBar } from "./GalleryFilterBar";
import { GalleryGrid, type GalleryImage } from "./GalleryGrid";

type Tour = { id: string; title: string };

type GalleryPageClientProps = {
  images: GalleryImage[];
  tours: Tour[];
};

export function GalleryPageClient({ images, tours }: GalleryPageClientProps) {
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

  const filteredImages = useMemo(() => {
    if (!selectedTourId) return images;
    return images.filter((img) => img.tour_id === selectedTourId);
  }, [images, selectedTourId]);

  return (
    <>
      {/* Hero med filter */}
      <section
        className="relative -mt-20 min-h-[65vh] w-full overflow-hidden pt-20"
        aria-labelledby="galleri-hero-heading"
      >
        <Image
          src="/hero-motorcycle.jpg"
          alt=""
          fill
          className="object-cover object-[50%_60%]"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/70"
          aria-hidden
        />
        <div
          className="absolute right-0 bottom-0 left-0 h-1/3 bg-linear-to-t from-black/90 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-28 sm:px-10 sm:pb-32 md:px-14 md:pb-36 lg:px-20 lg:pb-40">
          <h1
            id="galleri-hero-heading"
            className="text-primary text-4xl font-bold tracking-tight drop-shadow-sm sm:text-5xl md:text-6xl"
          >
            BILDEGALLERI
          </h1>
          <p className="text-foreground/95 mt-2 text-lg drop-shadow-sm sm:text-xl">
            Opplevelser fra våre turer
          </p>
        </div>
        <div className="border-border bg-card absolute right-0 bottom-4 left-0 flex border-t px-6 pt-4 pb-5 shadow-sm sm:px-10 sm:pt-5 sm:pb-6 md:px-14 md:pt-6 md:pb-8 lg:px-20 lg:pt-8 lg:pb-10">
          <div className="w-full">
            <GalleryFilterBar
              tours={tours}
              value={selectedTourId}
              onValueChange={setSelectedTourId}
            />
          </div>
        </div>
        <div
          className="bg-background absolute right-0 bottom-0 left-0 h-12"
          aria-hidden
        />
      </section>

      <div className="px-6 pt-4 pb-8 sm:px-8 md:px-10 lg:px-20">
        <GalleryGrid images={filteredImages} />
      </div>
    </>
  );
}
