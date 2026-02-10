"use client";

import { useEffect, useMemo, useState } from "react";
import type { Tour } from "@/lib/types";
import { TourCard } from "./TourCard";
import { Pagination } from "@/components/ui/pagination";

type ToursListWithPaginationProps = {
  tours: Tour[];
};

export function ToursListWithPagination({
  tours,
}: ToursListWithPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [toursPerPage, setToursPerPage] = useState(() => {
    if (typeof window === "undefined") {
      return 6;
    }
    return window.matchMedia("(max-width: 767px)").matches ? 3 : 6;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setToursPerPage(event.matches ? 3 : 6);
      setCurrentPage(1);
    };

    handleChange(mediaQuery as unknown as MediaQueryListEvent);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const totalPages = Math.ceil(tours.length / toursPerPage) || 1;

  const paginatedTours = useMemo(() => {
    if (tours.length === 0) return [];
    const startIndex = (currentPage - 1) * toursPerPage;
    const endIndex = startIndex + toursPerPage;
    return tours.slice(startIndex, endIndex);
  }, [tours, currentPage, toursPerPage]);

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
