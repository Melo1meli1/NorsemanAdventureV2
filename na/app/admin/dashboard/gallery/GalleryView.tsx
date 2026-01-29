import type { Tour } from "@/lib/types";

type GalleryViewProps = {
  tours: Tour[];
};

export function GalleryView({ tours }: GalleryViewProps) {
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
          <h2 className="text-lg font-semibold text-neutral-50">Gallerier</h2>
          <p className="text-sm text-neutral-400">
            Mapper opprettes automatisk for hver tur.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tours.map((tour) => (
          <article
            key={tour.id}
            className="bg-card border-primary/20 hover:border-primary/50 rounded-[18px] border px-5 py-4 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-neutral-50">
                  {tour.title}
                </h3>
                <p className="text-sm text-neutral-400">
                  {tour.location ?? "Ingen lokasjon registrert"}
                </p>
              </div>
              <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-300">
                0 bilder
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
