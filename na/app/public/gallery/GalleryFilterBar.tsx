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
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button
          type="button"
          size="default"
          variant={value === null ? "default" : "outline"}
          className="w-full font-semibold uppercase sm:w-auto"
          onClick={() => onValueChange(null)}
        >
          ALLE BILDER
        </Button>
        <Select
          value={value ?? ""}
          onValueChange={(v) => onValueChange(v || null)}
        >
          <SelectTrigger
            className="bg-background border-border w-full sm:min-w-[200px] lg:min-w-[280px]"
            aria-label="Velg tur for å filtrere bilder"
          >
            <SelectValue placeholder="Velg en tur…" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            className="bg-background border-border w-full sm:w-[max(200px,var(--radix-select-trigger-width))] lg:w-[max(280px,var(--radix-select-trigger-width))]"
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
