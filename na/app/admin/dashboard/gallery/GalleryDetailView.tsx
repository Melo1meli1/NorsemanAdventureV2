import { ArrowLeft, ImageIcon, Plus } from "lucide-react";
import type { Tour } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

type GalleryDetailViewProps = {
  tour: Tour;
  onBack: () => void;
};

export function GalleryDetailView({ tour, onBack }: GalleryDetailViewProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-neutral-300 hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Tilbake til turer</span>
        </Button>
        <Button type="button" className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" aria-hidden />
          <span>Last opp bilder</span>
        </Button>
      </div>

      <Card className="bg-card border-primary/20 rounded-[18px] border">
        <CardContent className="space-y-8 px-6 py-8">
          <div className="space-y-2">
            <CardTitle className="text-xl text-neutral-50">
              {tour.title} - Bilder
            </CardTitle>
            <p className="text-sm text-neutral-400">
              Administrer bilder sortert etter tur
            </p>
          </div>

          <div className="rounded-[18px] border border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700/80 bg-neutral-800/70 text-neutral-300">
              <ImageIcon className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-50">
              Ingen bilder enda
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Dra og slipp bilder her, eller klikk for å laste opp
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/10 mt-5"
            >
              Velg filer
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
