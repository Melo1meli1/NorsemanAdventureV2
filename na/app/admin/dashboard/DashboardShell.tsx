"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Home,
  Mountain,
  Newspaper,
  ImageIcon,
  ClipboardList,
  BookOpen,
  Users,
  MapPin,
  X,
} from "lucide-react";
import type { Tour } from "@/lib/types";
import { BOOKING_STATUS_LABELS } from "@/lib/zod/bookingValidation";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";
import {
  getBookingStats,
  getRecentBookings,
  type BookingStats,
} from "./actions/bookings";
import { LogoutButton } from "./utils/LogoutButton";
import { TourListView } from "./tours/TourListView";
import { GalleryView } from "./gallery/GalleryView";
import { GalleryDetailView } from "./gallery/GalleryDetailView";
import { OrdersView } from "./orders/OrdersView";
import { GalleryOnlyView } from "./gallery/GalleryOnlyView";

const navItems = [
  { id: "overview", label: "Oversikt", icon: Home },
  { id: "tours", label: "Turer", icon: Mountain },
  { id: "news", label: "Nyheter", icon: Newspaper },
  { id: "orders", label: "Bestillinger", icon: ClipboardList },
  { id: "gallery", label: "Galleri", icon: ImageIcon },
] as const;

type DashboardShellProps = {
  tours?: Tour[];
};

export function DashboardShell({ tours = [] }: DashboardShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const validSections = [
    "overview",
    "tours",
    "news",
    "orders",
    "gallery",
  ] as const;
  const sectionFromUrl = searchParams.get("section");
  const resolvedSection = validSections.includes(
    sectionFromUrl as (typeof validSections)[number],
  )
    ? (sectionFromUrl as (typeof validSections)[number])
    : "overview";
  const [activeSection, setActiveSection] = useState<
    "overview" | "tours" | "news" | "orders" | "gallery"
  >(() => resolvedSection);
  const [selectedGalleryTour, setSelectedGalleryTour] = useState<Tour | null>(
    null,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [kpiStats, setKpiStats] = useState<BookingStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<
    Array<{
      id: string;
      navn: string;
      turTittel: string;
      status:
        | "betalt"
        | "ikke_betalt"
        | "venteliste"
        | "kansellert"
        | "delvis_betalt";
    }>
  >([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [showGalleryOnlyView, setShowGalleryOnlyView] = useState(false);

  const sectionTitle = {
    overview: "Oversikt",
    tours: "Turer",
    news: "Nyheter",
    orders: "Bestillinger",
    gallery: "Galleri",
  }[activeSection];

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const [statsResult, recentResult] = await Promise.all([
        getBookingStats(),
        getRecentBookings(3),
      ]);
      if (statsResult.success) {
        setKpiStats(statsResult.data);
      } else {
        setStatsError("Kunne ikke hente KPI-data.");
      }
      if (recentResult.success) {
        setRecentBookings(recentResult.data);
      }
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setStatsError("En feil oppstod. Viser siste lagrede data.");
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeSection === "overview") {
      params.delete("section");
    } else {
      params.set("section", activeSection);
    }
    const nextParams = params.toString();
    if (nextParams === searchParams.toString()) {
      return;
    }
    router.replace(nextParams ? `?${nextParams}` : "");
  }, [activeSection, searchParams, router]);

  useEffect(() => {
    if (activeSection === "overview") {
      fetchStats();
    }
  }, [activeSection, fetchStats]);

  // Realtime: oppdater KPI og Siste bestillinger ved endringer i bookings/participants
  const statsRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const STATS_DEBOUNCE_MS = 600;

  useEffect(() => {
    if (activeSection !== "overview") return;

    const supabase = getSupabaseBrowserClient();

    const scheduleStatsRefresh = () => {
      if (statsRefreshTimeoutRef.current)
        clearTimeout(statsRefreshTimeoutRef.current);
      statsRefreshTimeoutRef.current = setTimeout(() => {
        statsRefreshTimeoutRef.current = null;
        fetchStats();
      }, STATS_DEBOUNCE_MS);
    };

    const channel = supabase
      .channel("dashboard-stats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => scheduleStatsRefresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => scheduleStatsRefresh(),
      )
      .subscribe();

    return () => {
      if (statsRefreshTimeoutRef.current)
        clearTimeout(statsRefreshTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [activeSection, fetchStats]);

  return (
    <main className="bg-page-background flex min-h-screen text-neutral-50">
      {/* Sidebar */}
      <aside className="bg-card hidden w-64 flex-col border-r border-neutral-800 md:flex">
        <Link
          href="/"
          className="flex items-center gap-3 border-b border-neutral-800 px-6 py-5 text-neutral-50"
          aria-label="Gå til nettsiden"
        >
          <div className="flex h-10 w-8 items-center justify-center rounded-full">
            <Image
              src="/logonew.png"
              alt=""
              width={40}
              height={35}
              className="h-10 w-10 rounded-full object-contain"
            />
          </div>
          <span className="text-sm font-semibold tracking-wide">ADMIN</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-5 text-sm">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveSection(id);
                if (id !== "gallery") {
                  setSelectedGalleryTour(null);
                }
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium ${
                activeSection === id
                  ? "bg-primary text-primary-foreground"
                  : "text-neutral-300 hover:bg-neutral-800/80"
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                  activeSection === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-neutral-900/80 text-neutral-400"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-3 border-t border-neutral-800 px-4 py-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white">admin</span>
              <span className="text-xs text-neutral-400">Administrator</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobil-meny: overlay + drawer – kun synlig på små skjermer (md:hidden) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-modal="true"
          role="dialog"
          aria-label="Meny"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Lukk meny"
          />
          <aside className="bg-card absolute top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-800 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-4">
              <Link
                href="/"
                className="flex items-center gap-3 text-neutral-50"
                aria-label="Gå til nettsiden"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-9 w-8 items-center justify-center rounded-full">
                  <Image
                    src="/logonew.png"
                    alt=""
                    width={40}
                    height={35}
                    className="h-10 w-10 rounded-full object-contain"
                  />
                </div>
                <span className="text-sm font-semibold tracking-wide">
                  ADMIN
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white"
                aria-label="Lukk meny"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 text-sm">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActiveSection(id);
                    if (id !== "gallery") setSelectedGalleryTour(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium ${
                    activeSection === id
                      ? "bg-primary text-primary-foreground"
                      : "text-neutral-300 hover:bg-neutral-800/80"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                      activeSection === id
                        ? "bg-primary text-primary-foreground"
                        : "bg-neutral-900/80 text-neutral-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </nav>
            <div className="space-y-3 border-t border-neutral-800 px-4 py-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white">admin</span>
                  <span className="text-xs text-neutral-400">
                    Administrator
                  </span>
                </div>
              </div>
              <LogoutButton />
            </div>
          </aside>
        </div>
      )}

      <section className="flex flex-1 flex-col">
        <header className="bg-page-background flex items-center justify-between border-b border-neutral-800 px-4 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-700 md:hidden"
              aria-label="Åpne meny"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold md:text-xl">{sectionTitle}</h1>
          </div>
          <Link
            href="/"
            className="border-primary/60 bg-primary/90 hover:bg-primary/40 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            SE NETTSIDE
          </Link>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-8">
          {activeSection === "overview" && (
            <>
              {statsError && (
                <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-2 text-sm text-red-300">
                  {statsError}
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {isLoadingStats && !kpiStats
                  ? // Skeleton loaders for KPI-kortene
                    Array.from({ length: 4 }).map((_, i) => (
                      <article
                        key={i}
                        className="bg-card border-primary/20 flex flex-col justify-center rounded-[18px] border px-6 py-4"
                        aria-hidden
                      >
                        <div className="flex items-center gap-4">
                          <span className="h-12 w-12 animate-pulse rounded-full bg-neutral-700" />
                          <div className="flex flex-col gap-2">
                            <span className="h-8 w-24 animate-pulse rounded bg-neutral-700" />
                            <span className="h-4 w-20 animate-pulse rounded bg-neutral-800" />
                          </div>
                        </div>
                      </article>
                    ))
                  : [
                      {
                        label: "Totale bestillinger",
                        value: kpiStats?.totaleBestillinger.toString() ?? "0",
                        tone: "orange" as const,
                        Icon: BookOpen,
                      },
                      {
                        label: "Bekreftet",
                        value: kpiStats?.bekreftet.toString() ?? "0",
                        tone: "green" as const,
                        Icon: Users,
                      },
                      {
                        label: "Venteliste",
                        value: kpiStats?.venteliste.toString() ?? "0",
                        tone: "yellow" as const,
                        Icon: Users,
                      },
                      {
                        label: "Ledige plasser",
                        value: kpiStats?.ledigePlasser.toString() ?? "0",
                        tone: "blue" as const,
                        Icon: MapPin,
                      },
                    ].map((card) => (
                      <article
                        key={card.label}
                        className="bg-card hover:bg-card/90 border-primary/30 hover:border-primary/60 flex transform flex-col justify-center rounded-[18px] border px-6 py-4 transition hover:-translate-y-0.5"
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`flex h-12 w-12 items-center justify-center rounded-full ${
                              card.tone === "orange"
                                ? "bg-primary/20 text-primary"
                                : card.tone === "green"
                                  ? "bg-green-500/20 text-green-400"
                                  : card.tone === "yellow"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            <card.Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold text-neutral-50">
                              {card.value}
                            </span>
                            <span className="text-sm text-neutral-400">
                              {card.label}
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
              </div>

              <section className="bg-card border-primary/20 overflow-hidden rounded-[18px] border">
                <header className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
                  <h2 className="text-sm font-semibold md:text-base">
                    Siste bestillinger
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveSection("orders")}
                    className="border-primary/60 text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium"
                  >
                    <span>Se alle</span>
                    <span>›</span>
                  </button>
                </header>
                {isLoadingStats && recentBookings.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-5 py-8">
                    <div className="h-4 w-32 animate-pulse rounded bg-neutral-800" />
                    <div className="h-3 w-24 animate-pulse rounded bg-neutral-800" />
                    <div className="mt-2 h-3 w-28 animate-pulse rounded bg-neutral-800" />
                  </div>
                ) : recentBookings.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-neutral-400">
                    Ingen bestillinger ennå.
                  </div>
                ) : (
                  <ul className="divide-y divide-neutral-800 text-sm">
                    {recentBookings.map((order) => {
                      const isBekreftet = order.status === "betalt";
                      const statusLabel = BOOKING_STATUS_LABELS[order.status];
                      return (
                        <li
                          key={order.id}
                          className="flex items-center justify-between px-5 py-3"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-neutral-50">
                              {order.navn}
                            </span>
                            <span className="text-sm text-neutral-400">
                              {order.turTittel}
                            </span>
                          </div>
                          <span className="text-xs font-medium">
                            {isBekreftet ? (
                              <span className="bg-primary/20 text-primary rounded-full px-2 py-1">
                                {statusLabel}
                              </span>
                            ) : order.status === "venteliste" ? (
                              <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-yellow-400">
                                {statusLabel}
                              </span>
                            ) : (
                              <span className="rounded-full bg-neutral-800 px-2 py-1 text-neutral-300">
                                {statusLabel}
                              </span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </>
          )}

          {activeSection === "tours" && (
            <TourListView
              tours={tours}
              onOpenGalleryForTour={(tour) => {
                setSelectedGalleryTour(tour);
                setActiveSection("gallery");
              }}
            />
          )}

          {activeSection === "news" && (
            <div>
              <p className="text-sm text-neutral-400">
                Nyheter-seksjon. NewsList / NewsView kan kobles inn her.
              </p>
            </div>
          )}

          {/* Hold OrdersView mounted men skjult når inaktiv, så state (bestillinger) bevares ved tab-bytt. isActive=false hindrer fetch når bruker søker på Turer. */}
          <div
            className={activeSection === "orders" ? "block" : "hidden"}
            aria-hidden={activeSection !== "orders"}
          >
            <OrdersView isActive={activeSection === "orders"} />
          </div>

          {activeSection === "gallery" &&
            (selectedGalleryTour ? (
              <GalleryDetailView
                tour={selectedGalleryTour}
                onBack={() => setSelectedGalleryTour(null)}
              />
            ) : showGalleryOnlyView ? (
              <GalleryOnlyView onBack={() => setShowGalleryOnlyView(false)} />
            ) : (
              <GalleryView
                tours={tours}
                onSelectTour={(tour) => setSelectedGalleryTour(tour)}
                onOpenGalleryOnly={() => setShowGalleryOnlyView(true)}
              />
            ))}
        </div>
      </section>
    </main>
  );
}
