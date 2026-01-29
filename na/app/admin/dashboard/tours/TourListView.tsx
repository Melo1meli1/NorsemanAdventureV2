"use client";
import { deleteTour } from "../actions/tours";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import type { Tour } from "@/lib/types";
import { ConfirmDialog } from "../utils/ConfirmDialog";
import TourFormModal from "./TourFormModal";

type TourListViewProps = {
  tours: Tour[];
  onEdit?: (tour: Tour) => void;
  onNewTour?: () => void;
};

function formatDate(iso: string | null): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toISOString().slice(0, 10);
}

export function TourListView({ tours, onEdit, onNewTour }: TourListViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Tour | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const fallbackImages = [
    "/hero-motorcycle.jpg",
    "/tour-asphalt.jpg",
    "/tour-gravel.jpg",
    "/tour-summer.jpg",
  ];
  function resolveImageSrc(imageUrl: string | null, index: number) {
    if (imageUrl) {
      if (imageUrl.startsWith("http")) {
        return { src: imageUrl, unoptimized: true };
      }
      if (imageUrl.startsWith("/")) {
        return { src: imageUrl, unoptimized: false };
      }
      return { src: `/${imageUrl}`, unoptimized: false };
    }
    return {
      src: fallbackImages[index % fallbackImages.length],
      unoptimized: false,
    };
  }

  const filteredTours = useMemo(() => {
    if (!search.trim()) return tours;
    const q = search.trim().toLowerCase();
    return tours.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.short_description?.toLowerCase().includes(q) ?? false) ||
        (t.long_description?.toLowerCase().includes(q) ?? false) ||
        (t.sted?.toLowerCase().includes(q) ?? false),
    );
  }, [tours, search]);

  function handleRequestDelete(tour: Tour) {
    setPendingDelete(tour);
  }

  function handleOpenNewTour() {
    if (onNewTour) {
      onNewTour();
      return;
    }
    setEditingTour(null);
    setIsFormOpen(true);
  }

  function handleOpenEditTour(tour: Tour) {
    if (onEdit) {
      onEdit(tour);
      return;
    }
    setEditingTour(tour);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingTour(null);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    console.log("Deleting tour:", pendingDelete.id);
    const formData = new FormData();
    formData.append("id", String(pendingDelete.id));

    const result = await deleteTour(formData);

    if (result?.success) {
      router.refresh();
    }

    setPendingDelete(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header: Search + New Tour button */}
      <div className="flex items-center justify-between">
        <div className="bg-card focus-within:border-primary relative w-80 rounded-lg border-2 border-transparent transition-colors">
          <Search
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk etter turer..."
            className="h-11 w-full rounded-lg bg-transparent pr-3 pl-10 text-sm text-neutral-200 outline-none placeholder:text-neutral-500"
            aria-label="Søk etter turer"
          />
        </div>
        <button
          type="button"
          onClick={handleOpenNewTour}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold uppercase transition"
        >
          <Plus className="h-4 w-4" />
          NY TUR
        </button>
      </div>

      {/* Tour list */}
      <ul className="flex flex-col gap-4">
        {filteredTours.length === 0 ? (
          <li className="rounded-lg border border-neutral-800 bg-[#161920] px-6 py-12 text-center text-sm text-neutral-400">
            {search.trim()
              ? "Ingen turer matcher søket."
              : "Ingen turer ennå. Opprett en tur for å komme i gang."}
          </li>
        ) : (
          filteredTours.map((tour, index) => {
            const { src, unoptimized } = resolveImageSrc(tour.image_url, index);
            return (
              <li
                key={tour.id}
                className="flex items-center gap-4 rounded-lg border border-neutral-800 bg-[#161920] p-4 transition hover:border-neutral-700"
              >
                {/* Thumbnail */}
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                  <Image
                    src={src}
                    alt={tour.title}
                    fill
                    className="object-cover"
                    sizes="72px"
                    unoptimized={unoptimized}
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-white">
                    {tour.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" aria-hidden />
                      {formatDate(tour.start_date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" aria-hidden />
                      0/{tour.seats_available}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" aria-hidden />
                      {tour.sted ?? "–"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenEditTour(tour)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground flex h-11 w-11 items-center justify-center rounded-lg border bg-transparent transition-colors"
                    aria-label={`Rediger ${tour.title}`}
                  >
                    <Pencil className="h-5 w-5 text-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestDelete(tour)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground flex h-11 w-11 items-center justify-center rounded-lg border bg-transparent transition-colors"
                    aria-label={`Slett ${tour.title}`}
                  >
                    <Trash2 className="h-5 w-5 text-current" />
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Slett tur"
        description="Er du sikker på at du vil slette denne turen? Denne handlingen kan ikke angres."
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          handleConfirmDelete();
        }}
        confirmLabel="Slett"
        cancelLabel="Avbryt"
      />

      <TourFormModal
        open={isFormOpen}
        mode={editingTour ? "edit" : "create"}
        initialTour={editingTour}
        onClose={handleCloseForm}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
