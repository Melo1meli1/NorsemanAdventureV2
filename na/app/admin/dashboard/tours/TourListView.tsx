"use client";
import { deleteTour } from "../actions/tours";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFilteredBySearch } from "@/hooks/useSearchQuery";
import Image from "next/image";
import {
  Calendar,
  ImageIcon,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import type { Tour } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "../utils/ConfirmDialog";
import TourFormModal from "./TourFormModal";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/common/SearchInput";

type TourListViewProps = {
  tours: Tour[];
  onEdit?: (tour: Tour) => void;
  onNewTour?: () => void;
  onOpenGalleryForTour?: (tour: Tour) => void;
};

function formatDate(iso: string | null): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toISOString().slice(0, 10);
}

export function TourListView({
  tours,
  onEdit,
  onNewTour,
  onOpenGalleryForTour,
}: TourListViewProps) {
  const router = useRouter();
  const tourSearchKeys = useMemo(() => ["title", "sted"] as const, []);
  const filteredTours = useFilteredBySearch(tours, tourSearchKeys);
  const [pendingDelete, setPendingDelete] = useState<Tour | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const TOURS_PER_PAGE = 6;

  const totalPages = Math.ceil(filteredTours.length / TOURS_PER_PAGE) || 1;
  const displayPage = Math.min(currentPage, totalPages);

  function resolveImageSrc(imageUrl: string | null) {
    if (!imageUrl) return null;

    if (imageUrl.startsWith("http")) {
      return { src: imageUrl, unoptimized: true as const };
    }
    if (imageUrl.startsWith("/")) {
      return { src: imageUrl, unoptimized: false as const };
    }
    return { src: `/${imageUrl}`, unoptimized: false as const };
  }

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

  const paginatedTours = useMemo(() => {
    if (filteredTours.length === 0) return [];
    const startIndex = (displayPage - 1) * TOURS_PER_PAGE;
    const endIndex = startIndex + TOURS_PER_PAGE;
    return filteredTours.slice(startIndex, endIndex);
  }, [filteredTours, displayPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header: New Tour button */}
      <div className="flex items-center justify-between">
        <SearchInput
          placeholder="Søk etter tur"
          className="w-full sm:max-w-xs"
        />
        <Button
          type="button"
          onClick={handleOpenNewTour}
          className="h-11 gap-2 px-5 font-semibold uppercase"
        >
          <Plus className="h-4 w-4" />
          NY TUR
        </Button>
      </div>

      {/* Tour list */}
      <ul className="flex flex-col gap-4">
        {filteredTours.length === 0 ? (
          <li className="rounded-lg border border-neutral-800 bg-[#161920] px-6 py-12 text-center text-sm text-neutral-400">
            {tours.length === 0
              ? "Ingen turer ennå. Opprett en tur for å komme i gang."
              : "Ingen turer matcher søket."}
          </li>
        ) : (
          paginatedTours.map((tour) => {
            const imageConfig = resolveImageSrc(tour.image_url);
            return (
              <li
                key={tour.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenEditTour(tour)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenEditTour(tour);
                  }
                }}
                className="hover:border-primary/60 focus-visible:ring-primary/70 flex cursor-pointer items-center gap-4 rounded-lg border border-neutral-800 bg-[#161920] p-4 transition hover:-translate-y-0.5 hover:bg-[#191d28] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090b10] focus-visible:outline-none"
              >
                {/* Thumbnail */}
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                  {imageConfig ? (
                    <Image
                      src={imageConfig.src}
                      alt={tour.title}
                      fill
                      className="object-cover"
                      sizes="72px"
                      unoptimized={imageConfig.unoptimized}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-500">
                      <ImageIcon className="h-5 w-5" aria-hidden />
                    </div>
                  )}
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
                      {(tour as { total_seats?: number }).total_seats != null
                        ? `${(tour as { total_seats: number }).total_seats - tour.seats_available}/${(tour as { total_seats: number }).total_seats}`
                        : `0/${tour.seats_available}`}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" aria-hidden />
                      {tour.sted ?? "–"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-11 w-11 border-2 bg-transparent"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenEditTour(tour);
                    }}
                    aria-label={`Rediger ${tour.title}`}
                  >
                    <Pencil className="h-5 w-5 text-current" />
                  </Button>
                  {onOpenGalleryForTour && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-11 w-11 border-2 bg-transparent"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenGalleryForTour(tour);
                      }}
                      aria-label={`Åpne galleri for ${tour.title}`}
                    >
                      <ImageIcon className="h-5 w-5 text-current" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-11 w-11 border-2 bg-transparent"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRequestDelete(tour);
                    }}
                    aria-label={`Slett ${tour.title}`}
                  >
                    <Trash2 className="h-5 w-5 text-current" />
                  </Button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <Pagination
        currentPage={displayPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

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
