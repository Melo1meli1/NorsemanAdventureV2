"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const computedHasNextPage =
    typeof hasNextPage === "boolean" ? hasNextPage : currentPage < totalPages;

  const goToPrevious = () => {
    if (currentPage <= 1) return;
    window.scrollTo(0, 0);
    onPageChange(currentPage - 1);
  };

  const goToNext = () => {
    if (!computedHasNextPage) return;
    window.scrollTo(0, 0);
    onPageChange(currentPage + 1);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-neutral-600 text-neutral-200"
        onClick={goToPrevious}
        disabled={currentPage <= 1}
        aria-label="Forrige side"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="sr-only sm:not-sr-only sm:ml-1">Forrige</span>
      </Button>
      <span className="px-3 text-sm text-neutral-300" aria-live="polite">
        Side {currentPage} av {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-neutral-600 text-neutral-200"
        onClick={goToNext}
        disabled={!computedHasNextPage}
        aria-label="Neste side"
      >
        <span className="sr-only sm:not-sr-only sm:mr-1">Neste</span>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
