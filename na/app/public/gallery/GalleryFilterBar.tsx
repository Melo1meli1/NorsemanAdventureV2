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
};

export function GalleryFilterBar({ tours }: GalleryFilterBarProps) {
  return (
    <div className="flex w-full flex-wrap items-start gap-3">
      <Button type="button" size="default" className="font-semibold uppercase">
        ALLE BILDER
      </Button>
      <Select>
        <SelectTrigger
          className="max-w-xs min-w-[200px] flex-1"
          aria-label="Velg tur for å filtrere bilder"
        >
          <SelectValue placeholder="Velg en tur…" />
        </SelectTrigger>
        <SelectContent position="popper" align="start">
          {tours.map((tour) => (
            <SelectItem key={tour.id} value={tour.id}>
              {tour.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
