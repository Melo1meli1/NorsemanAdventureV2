"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Pencil, Search, Trash2, Users } from "lucide-react";
import type { Tour } from "@/lib/types";
import { deleteTour } from "./actions/tours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TourListViewProps = {
  tours: Tour[];
  onEdit?: (tour: Tour) => void;
};

function formatDate(iso: string | null): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function TourListView({ tours, onEdit }: TourListViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredTours = useMemo(() => {
    if (!search.trim()) return tours;
    const q = search.trim().toLowerCase();
    return tours.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false),
    );
  }, [tours, search]);

  async function handleDelete(tour: Tour) {
    if (!confirm(`Er du sikker på at du vil slette «${tour.title}»?`)) return;
    const formData = new FormData();
    formData.set("id", tour.id);
    const result = await deleteTour(formData);
    if (result?.success) {
      router.refresh();
    } else if (result?.error) {
      alert(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search
          className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Søk etter turer..."
          className="h-11 pl-10"
          aria-label="Søk etter turer"
        />
      </div>

      <ul className="flex flex-col gap-3">
        {filteredTours.length === 0 ? (
          <li>
            <Card className="border-neutral-700 bg-neutral-900/50 px-4 py-8 text-center text-sm text-neutral-400">
              {search.trim()
                ? "Ingen turer matcher søket."
                : "Ingen turer ennå. Opprett en tur for å komme i gang."}
            </Card>
          </li>
        ) : (
          filteredTours.map((tour) => (
            <li key={tour.id}>
              <Card
                className={cn(
                  "flex items-center gap-4 border-neutral-700 bg-neutral-900/70 p-3 transition hover:border-neutral-600",
                  "rounded-[18px] border",
                )}
              >
                <div className="bg-muted relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                  {tour.image_url ? (
                    <Image
                      src={tour.image_url}
                      alt={tour.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized
                    />
                  ) : (
                    <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                      <MapPin className="h-6 w-6" aria-hidden />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-neutral-50">
                    {tour.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" aria-hidden />
                      {formatDate(tour.start_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" aria-hidden />
                      0/{tour.seats_available}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />–
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    onClick={() => onEdit?.(tour)}
                    className="border-primary h-9 w-9 border"
                    aria-label={`Rediger ${tour.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(tour)}
                    className="h-9 w-9 border-neutral-600 text-neutral-400 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Slett ${tour.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
