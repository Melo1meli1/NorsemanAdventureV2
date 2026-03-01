"use client";

import { useMemo } from "react";
import {
  Route,
  Mountain,
  Newspaper,
  Calendar,
  MapPin,
  Users,
} from "lucide-react";
// import {ClipboardList} from "lucide-react";

import type { Tour } from "@/lib/types";
import type { News } from "@/lib/types/news";

type OverviewSectionProps = {
  tours: Tour[];
  news: News[];
  bookingCount?: number;
  onGoToTours: () => void;
  onGoToNews: () => void;
  onGoToOrders: () => void;
  homepageVisitsThisMonth?: number;
};

export function OverviewSection({
  tours,
  news,
  onGoToTours,
  onGoToNews,
  homepageVisitsThisMonth,
}: OverviewSectionProps) {
  const now = new Date();

  const activeToursCount = useMemo(
    () => tours.filter((t) => t.status === "published").length,
    [tours],
  );

  const totalToursCount = tours.length;

  const publishedNewsCount = useMemo(
    () => news.filter((n) => n.status === "published").length,
    [news],
  );

  const upcomingTours = useMemo(() => {
    return tours
      .filter((t) => {
        if (t.status !== "published") return false;
        const start = new Date(t.start_date);
        return !Number.isNaN(start.getTime()) && start > now;
      })
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      )
      .slice(0, 6);
  }, [tours, now]);

  const latestNews = useMemo(() => {
    return news
      .filter((n) => n.status === "published")
      .slice()
      .sort((a, b) => {
        const da = new Date(a.published_at ?? a.created_at ?? 0).getTime();
        const db = new Date(b.published_at ?? b.created_at ?? 0).getTime();
        return db - da;
      })
      .slice(0, 6);
  }, [news]);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    tone,
    onClick,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    tone: "orange" | "green" | "blue" | "purple";
    onClick?: () => void;
  }) => (
    <article
      className={[
        "bg-card border-primary/30 hover:border-primary/60 flex transform flex-col justify-center rounded-[18px] border px-6 py-4 transition hover:-translate-y-0.5",
        onClick ? "hover:bg-card/90 cursor-pointer" : "",
      ].join(" ")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className={[
            "flex h-12 w-12 items-center justify-center rounded-full",
            tone === "orange" && "bg-primary/20 text-primary",
            tone === "green" && "bg-green-500/20 text-green-400",
            tone === "blue" && "bg-blue-500/20 text-blue-400",
            tone === "purple" && "bg-purple-500/20 text-purple-400",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-neutral-50">{value}</span>
          <span className="text-sm text-neutral-400">{label}</span>
        </div>
      </div>
    </article>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Route}
          label="Aktive turer"
          value={activeToursCount}
          tone="orange"
          onClick={onGoToTours}
        />
        <StatCard
          icon={Mountain}
          label="Totalt turer"
          value={totalToursCount}
          tone="green"
          onClick={onGoToTours}
        />
        <StatCard
          icon={Newspaper}
          label="Publiserte nyheter"
          value={publishedNewsCount}
          tone="blue"
          onClick={onGoToNews}
        />
        <StatCard
          icon={Users}
          label="Besøk denne måneden"
          value={homepageVisitsThisMonth ?? 0}
          tone="purple"
        />
      </div>

      {/* To kolonner på desktop: kommende turer + siste nyheter */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kommende turer */}
        <section className="bg-card border-primary/20 overflow-hidden rounded-[18px] border">
          <header className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
            <h2 className="text-sm font-semibold md:text-base">
              Kommende turer
            </h2>
            <button
              type="button"
              onClick={onGoToTours}
              className="border-primary/60 text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium"
            >
              <span>Se alle</span>
              <span>›</span>
            </button>
          </header>

          {upcomingTours.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-neutral-400">
              Ingen kommende turer
            </div>
          ) : (
            <ul className="divide-y divide-neutral-800 text-sm">
              {upcomingTours.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-neutral-50">
                      {t.title}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" aria-hidden />
                        {new Date(t.start_date).toLocaleDateString("no-NO")}
                      </span>
                      {t.sted ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" aria-hidden />
                          {t.sted}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Siste nyheter */}
        <section className="bg-card border-primary/20 overflow-hidden rounded-[18px] border">
          <header className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
            <h2 className="text-sm font-semibold md:text-base">
              Siste nyheter
            </h2>
            <button
              type="button"
              onClick={onGoToNews}
              className="border-primary/60 text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium"
            >
              <span>Se alle</span>
              <span>›</span>
            </button>
          </header>

          {latestNews.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-neutral-400">
              Ingen publiserte nyheter
            </div>
          ) : (
            <ul className="divide-y divide-neutral-800 text-sm">
              {latestNews.map((n) => (
                <li key={n.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-neutral-50">
                      {n.title}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-400">
                      {new Date(
                        n.published_at ?? n.created_at ?? 0,
                      ).toLocaleDateString("no-NO")}
                    </div>
                  </div>
                  <span className="bg-primary/20 text-primary shrink-0 rounded-full px-2 py-1 text-xs font-medium">
                    Publisert
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
