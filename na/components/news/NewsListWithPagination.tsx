"use client";

import { useEffect, useMemo, useState } from "react";
import type { News } from "@/lib/types/news";
import { NewsCard } from "./NewsCard";
import { Pagination } from "@/components/ui/pagination";

type NewsListWithPaginationProps = {
  news: News[];
};

export function NewsListWithPagination({ news }: NewsListWithPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [newsPerPage, setNewsPerPage] = useState(() => {
    if (typeof window === "undefined") {
      return 3;
    }
    return window.matchMedia("(max-width: 767px)").matches ? 2 : 3;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setNewsPerPage(event.matches ? 2 : 3);
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

  const totalPages = Math.ceil(news.length / newsPerPage) || 1;

  const paginatedNews = useMemo(() => {
    if (news.length === 0) return [];
    const startIndex = (currentPage - 1) * newsPerPage;
    const endIndex = startIndex + newsPerPage;
    return news.slice(startIndex, endIndex);
  }, [news, currentPage, newsPerPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (news.length === 0) {
    return <p className="text-muted-foreground">Ingen publiserte nyheter.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {paginatedNews.map((newsItem) => (
          <NewsCard key={newsItem.id} news={newsItem} />
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
