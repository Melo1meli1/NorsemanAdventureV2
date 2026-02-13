"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Tour = { id: string; title: string };

type GalleryFilterBarProps = {
  tours: Tour[];
  /** null = alle bilder */
  value: string | null;
  onValueChange: (tourId: string | null) => void;
};

export function GalleryFilterBar({
  tours,
  value,
  onValueChange,
}: GalleryFilterBarProps) {
  return (
    <div className="flex w-full flex-wrap items-start gap-3">
      <div className="flex -translate-y-4 items-center gap-4">
        <Button
          type="button"
          size="default"
          className="font-semibold uppercase"
          onClick={() => onValueChange(null)}
        >
          ALLE BILDER
        </Button>
        <Select
          value={value ?? ""}
          onValueChange={(v) => onValueChange(v || null)}
        >
          <SelectTrigger
            className="bg-background border-border min-w-[280px] flex-1"
            aria-label="Velg tur for å filtrere bilder"
          >
            <SelectValue placeholder="Velg en tur…" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            className="bg-background border-border w-[max(280px,var(--radix-select-trigger-width))]"
          >
            {tours.map((tour) => (
              <SelectItem key={tour.id} value={tour.id}>
                {tour.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
