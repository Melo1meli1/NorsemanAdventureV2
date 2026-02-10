"use client";

import type { FileObject } from "@supabase/storage-js";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Folder } from "lucide-react";
import type { Tour } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";

type GalleryViewProps = {
  tours: Tour[];
  onSelectTour: (tour: Tour) => void;
};

function formatImageCount(n: number): string {
  return n === 1 ? "1 bilde" : `${n} bilder`;
}

export function GalleryView({ tours, onSelectTour }: GalleryViewProps) {
  const [imageCounts, setImageCounts] = useState<Record<string, number>>({});
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    if (tours.length === 0) return;

    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      await Promise.all(
        tours.map(async (tour) => {
          const { data, error } = await supabase.storage
            .from("tours-gallery")
            .list(`${tour.id}/`, { limit: 1000 });
          if (!error && data) {
            const files = data.filter(
              (f: FileObject) => f.name && !f.name.endsWith("/"),
            ).length;
            counts[tour.id] = files;
          } else {
            counts[tour.id] = 0;
          }
        }),
      );
      setImageCounts(counts);
    };

    fetchCounts();
  }, [supabase, tours]);

  if (tours.length === 0) {
    return (
      <section className="bg-card border-primary/20 rounded-[18px] border px-5 py-6 text-sm text-neutral-300">
        Ingen turer funnet. Opprett en tur i Turer-fanen for å få en mappe i
        galleriet og kunne administrere bilder.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-neutral-400">
            Mapper opprettes automatisk for hver tur. Her administrerer du
            bildene som hører til turene i admin.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour) => (
          <button
            key={tour.id}
            type="button"
            onClick={() => onSelectTour(tour)}
            className="bg-card border-primary/20 hover:border-primary/50 flex min-h-[88px] w-full items-center rounded-[18px] border px-5 py-5 text-left transition hover:-translate-y-0.5"
          >
            <div className="flex w-full items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-700/80 bg-neutral-800/80 text-neutral-400">
                <Folder className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <h3 className="truncate text-base font-semibold text-neutral-50">
                  {tour.title}
                </h3>
                <p className="text-sm text-neutral-400">
                  {formatImageCount(imageCounts[tour.id] ?? 0)}
                </p>
              </div>
              <ChevronRight
                className="h-5 w-5 shrink-0 text-neutral-400"
                aria-hidden
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
