"use client";

import { deleteNews } from "../actions/news";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import type { News } from "@/lib/types/news";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "../utils/ConfirmDialog";
import NewsFormModal from "./NewsFormModal";
import { Pagination } from "@/components/ui/pagination";

type NewsListViewProps = {
  news: News[];
};

function formatDate(iso: string | null): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toISOString().slice(0, 10);
}

export function NewsListView({ news }: NewsListViewProps) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<News | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const NEWS_PER_PAGE = 6;

  const totalPages = Math.ceil(news.length / NEWS_PER_PAGE) || 1;
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

  function handleOpenNewNews() {
    setEditingNews(null);
    setIsFormOpen(true);
  }

  function handleOpenEditNews(item: News) {
    setEditingNews(item);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingNews(null);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    const formData = new FormData();
    formData.append("id", String(pendingDelete.id));

    const result = await deleteNews(formData);

    if (result?.success) {
      router.refresh();
    }

    setPendingDelete(null);
  }

  const paginatedNews = useMemo(() => {
    if (news.length === 0) return [];
    const startIndex = (displayPage - 1) * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    return news.slice(startIndex, endIndex);
  }, [news, displayPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header: New News button */}
      <div className="flex items-center justify-end">
        <Button
          type="button"
          onClick={handleOpenNewNews}
          className="h-11 w-full gap-2 px-5 font-semibold uppercase sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          NY NYHET
        </Button>
      </div>

      {/* News list */}
      <ul className="flex flex-col gap-4">
        {news.length === 0 ? (
          <li className="rounded-lg border border-neutral-800 bg-[#161920] px-6 py-12 text-center text-sm text-neutral-400">
            Ingen nyheter ennå. Opprett en nyhet for å komme i gang.
          </li>
        ) : (
          paginatedNews.map((item: News) => {
            const imageConfig = resolveImageSrc(item.image_url);
            return (
              <li
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenEditNews(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenEditNews(item);
                  }
                }}
                className="hover:border-primary/60 focus-visible:ring-primary/70 flex cursor-pointer flex-col gap-3 rounded-lg border border-neutral-800 bg-[#161920] p-4 transition hover:-translate-y-0.5 hover:bg-[#191d28] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090b10] focus-visible:outline-none sm:flex-row sm:items-center sm:gap-4"
              >
                {/* Thumbnail */}
                <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                  {imageConfig ? (
                    <Image
                      src={imageConfig.src}
                      alt={item.title}
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
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-semibold text-white">
                      {item.title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        item.status === "published"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-neutral-700/60 text-neutral-400"
                      }`}
                    >
                      {item.status === "published" ? "Publisert" : "Utkast"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] text-neutral-400">
                    {item.short_description && (
                      <span className="line-clamp-1 max-w-xs">
                        {item.short_description}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" aria-hidden />
                      {formatDate(item.published_at ?? item.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-2 self-end sm:gap-3 sm:self-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-9 w-9 border-2 bg-transparent sm:h-11 sm:w-11"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenEditNews(item);
                    }}
                    aria-label={`Rediger ${item.title}`}
                  >
                    <Pencil className="h-4 w-4 text-current sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-9 w-9 border-2 bg-transparent sm:h-11 sm:w-11"
                    onClick={(event) => {
                      event.stopPropagation();
                      setPendingDelete(item);
                    }}
                    aria-label={`Slett ${item.title}`}
                  >
                    <Trash2 className="h-4 w-4 text-current sm:h-5 sm:w-5" />
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
        title="Slett nyhet"
        description="Er du sikker på at du vil slette denne nyheten? Denne handlingen kan ikke angres."
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          handleConfirmDelete();
        }}
        confirmLabel="Slett"
        cancelLabel="Avbryt"
      />

      <NewsFormModal
        open={isFormOpen}
        mode={editingNews ? "edit" : "create"}
        initialNews={editingNews}
        onClose={handleCloseForm}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
