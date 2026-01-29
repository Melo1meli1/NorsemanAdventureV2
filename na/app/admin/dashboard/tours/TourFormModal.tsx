"use client";

import { X } from "lucide-react";
import type { Tour } from "@/lib/types";
import { Button } from "@/components/ui/button";
import TourForm from "./TourForm";

type TourFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSuccess?: () => void;
  initialTour?: Tour | null;
};

export default function TourFormModal({
  open,
  mode,
  onClose,
  onSuccess,
  initialTour,
}: TourFormModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-form-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-card relative flex max-h-[90vh] w-full min-w-0 flex-col rounded-2xl border border-neutral-800 shadow-xl shadow-black/40"
        style={{ width: "min(100%, 680px)", height: "min(100%, 800px)" }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Tittel og lukk – alltid synlig øverst */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-800 px-6 py-4">
          <h2
            id="tour-form-modal-title"
            className="text-xl font-semibold text-white"
          >
            {mode === "edit" ? "Rediger tur" : "Opprett ny tur"}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Lukk"
            className="shrink-0 rounded-full text-neutral-400 hover:bg-neutral-800/70 hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Skjema – skroller under tittelen */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <TourForm
            mode={mode}
            initialTour={initialTour}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  );
}
