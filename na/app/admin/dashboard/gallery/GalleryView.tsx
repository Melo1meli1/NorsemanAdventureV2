import { ChevronRight, Folder } from "lucide-react";
import type { Tour } from "@/lib/types";

type GalleryViewProps = {
  tours: Tour[];
  onSelectTour: (tour: Tour) => void;
};

export function GalleryView({ tours, onSelectTour }: GalleryViewProps) {
  if (tours.length === 0) {
    return (
      <section className="bg-card border-primary/20 rounded-[18px] border px-5 py-6 text-sm text-neutral-300">
        Ingen turer funnet. Opprett en tur for å få en mappe i galleriet.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-neutral-400">
            Mapper opprettes automatisk for hver tur.
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
                <p className="text-sm text-neutral-400">0 bilder</p>
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
