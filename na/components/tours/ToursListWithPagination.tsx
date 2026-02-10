"use client";

import { useMemo, useState } from "react";
import type { Tour } from "@/lib/types";
import { TourCard } from "./TourCard";
import { Pagination } from "@/components/ui/pagination";

const TOURS_PER_PAGE = 6;

type ToursListWithPaginationProps = {
  tours: Tour[];
};

export function ToursListWithPagination({
  tours,
}: ToursListWithPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(tours.length / TOURS_PER_PAGE) || 1;

  const paginatedTours = useMemo(() => {
    if (tours.length === 0) return [];
    const startIndex = (currentPage - 1) * TOURS_PER_PAGE;
    const endIndex = startIndex + TOURS_PER_PAGE;
    return tours.slice(startIndex, endIndex);
  }, [tours, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (tours.length === 0) {
    return <p className="text-muted-foreground">Ingen publiserte turer.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {paginatedTours.map((tour) => (
          <TourCard key={tour.id} tour={tour} fromPage="turer" />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  );
}
