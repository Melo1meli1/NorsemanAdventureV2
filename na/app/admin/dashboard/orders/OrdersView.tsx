"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Trash2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";
import { BOOKING_STATUS_LABELS } from "@/lib/zod/bookingValidation";
import type { BookingStatus, BookingType } from "@/lib/types";
import {
  buildCsv,
  downloadCsv,
  escapeCsvField,
  sanitizeFilename,
} from "@/lib/csvUtils";
import {
  deleteBooking,
  getBookingsPage,
  type BookingWithDetails,
} from "../actions/bookings";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { OrdersFilterTabs, type OrdersFilterValue } from "./OrdersFilterTabs";
import { OrdersTableHeader } from "./OrdersTableHeader";
import { ConfirmDialog } from "../utils/ConfirmDialog";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SearchInput } from "@/components/common/SearchInput";

const ORDERS_PAGE_SIZE = 8;

/** Mock-rad for tabellen (felter som i schema; turTittel + tur-meta for gruppert visning). SOS vises ikke i panelet, men med i CSV. */
type OrderRow = {
  id: string;
  navn: string;
  epost: string;
  type: BookingType;
  turTittel: string;
  belop: number;
  status: BookingStatus;
  dato: string;
  telefon: string;
  antallDeltakere: number;
  tourDato?: string;
  tourTotalPlasser?: number;
  tourLedigePlasser?: number;
  sos_navn?: string | null;
  sos_telefon?: string | null;
  betaltBelop?: number | null;
  gjenstaendeBelop?: number | null;
  participants?: Array<{
    name: string;
    email: string;
    telefon: string;
    sos_navn?: string | null;
    sos_telefon?: string | null;
  }>;
};

function formatBelop(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  }).format(n);
}

function formatDato(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Bygg CSV-streng for en liste deltakere (én rad per deltaker). */
function buildBookingsCSV(orders: OrderRow[]): string {
  const header = [
    "Navn",
    "E-post",
    "Telefon",
    "Tur",
    "Bestillingsdato",
    "Status",
    "Beløp totalt",
    "Betalt",
    "Gjenstår",
    "Nødkontakt navn",
    "Nødkontakt telefon",
  ];
  const rows = orders.flatMap((order) => {
    if (order.participants && order.participants.length > 0) {
      return order.participants.map((participant) => [
        escapeCsvField(participant.name),
        escapeCsvField(participant.email),
        escapeCsvField(participant.telefon ?? ""),
        escapeCsvField(order.turTittel),
        escapeCsvField(formatDato(order.dato)),
        escapeCsvField(BOOKING_STATUS_LABELS[order.status]),
        escapeCsvField(formatBelop(order.belop)),
        escapeCsvField(
          order.betaltBelop != null ? formatBelop(order.betaltBelop) : "",
        ),
        escapeCsvField(
          order.gjenstaendeBelop != null
            ? formatBelop(order.gjenstaendeBelop)
            : "",
        ),
        escapeCsvField(participant.sos_navn ?? ""),
        escapeCsvField(participant.sos_telefon ?? ""),
      ]);
    }

    // Fallback: én rad per booking dersom participants mangler
    return [
      [
        escapeCsvField(order.navn),
        escapeCsvField(order.epost),
        escapeCsvField(order.telefon ?? ""),
        escapeCsvField(order.turTittel),
        escapeCsvField(formatDato(order.dato)),
        escapeCsvField(BOOKING_STATUS_LABELS[order.status]),
        escapeCsvField(formatBelop(order.belop)),
        escapeCsvField(
          order.betaltBelop != null ? formatBelop(order.betaltBelop) : "",
        ),
        escapeCsvField(
          order.gjenstaendeBelop != null
            ? formatBelop(order.gjenstaendeBelop)
            : "",
        ),
        escapeCsvField(order.sos_navn ?? ""),
        escapeCsvField(order.sos_telefon ?? ""),
      ],
    ];
  });
  return buildCsv(header, rows);
}

/**
 * Mapper BookingWithDetails til OrderRow-format for visning.
 */
function mapBookingToOrderRow(booking: BookingWithDetails): OrderRow {
  // Beregn betalt/gjenstående beløp basert på status
  let betaltBelop: number | null = null;
  let gjenstaendeBelop: number | null = null;

  if (booking.status === "betalt") {
    betaltBelop = booking.belop;
    gjenstaendeBelop = 0;
  } else if (booking.status === "delvis_betalt") {
    // For delvis betalt, estimer 50% betalt (kan endres senere hvis vi lagrer dette i DB)
    betaltBelop = Math.round(booking.belop * 0.5);
    gjenstaendeBelop = booking.belop - betaltBelop;
  } else {
    betaltBelop = null;
    gjenstaendeBelop = booking.belop;
  }

  // Hent første deltakers SOS-info som fallback
  const firstParticipant = booking.participants[0];
  const sos_navn = firstParticipant?.sos_navn ?? null;
  const sos_telefon = firstParticipant?.sos_telefon ?? null;

  return {
    id: booking.id,
    navn: booking.navn,
    epost: booking.epost,
    type: booking.type,
    turTittel: booking.tourTittel,
    belop: booking.belop,
    status: booking.status,
    dato: booking.dato,
    telefon: booking.telefon,
    antallDeltakere: booking.antallDeltakere,
    tourDato: booking.tourDato ?? undefined,
    tourTotalPlasser: booking.tourTotalPlasser ?? undefined,
    tourLedigePlasser: booking.tourLedigePlasser ?? undefined,
    sos_navn,
    sos_telefon,
    betaltBelop,
    gjenstaendeBelop,
    participants: booking.participants.map((p) => ({
      name: p.name,
      email: p.email,
      telefon: p.telefon,
      sos_navn: p.sos_navn,
      sos_telefon: p.sos_telefon,
    })),
  };
}

function StatusBadge({ status }: { status: OrderRow["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold sm:text-sm ${
        status === "betalt"
          ? "border border-green-600/60 bg-green-700 text-green-200"
          : status === "delvis_betalt"
            ? "border border-amber-600/70 bg-amber-700 text-amber-100"
            : status === "ikke_betalt"
              ? "border border-red-600/70 bg-red-800 text-red-100"
              : status === "venteliste"
                ? "border border-yellow-600/60 bg-yellow-500/20 text-yellow-400"
                : status === "kansellert"
                  ? "border border-neutral-600/60 bg-neutral-800/40 text-neutral-100"
                  : "border border-neutral-600/60 bg-neutral-800/40 text-neutral-100"
      }`}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

const TABLE_COLUMNS = 7;

function OrderTableRow({
  order,
  isExpanded,
  onToggle,
  onDelete,
  isDeleting,
  waitlistPosition,
}: {
  order: OrderRow;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  waitlistPosition?: number;
}) {
  return (
    <>
      <tr
        role="button"
        tabIndex={0}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("form") || target.closest("button")) return;
          onToggle();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="cursor-pointer text-sm text-neutral-200 hover:bg-neutral-800/30 sm:text-base"
        aria-expanded={isExpanded}
      >
        <td className="px-4 py-5">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500" aria-hidden>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
            {waitlistPosition !== undefined && (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400"
                aria-label={`Posisjon ${waitlistPosition} på venteliste`}
                title={`Posisjon ${waitlistPosition} på venteliste`}
              >
                {waitlistPosition}
              </span>
            )}
            <span className="font-semibold text-neutral-50">{order.navn}</span>
          </div>
        </td>
        <td className="px-4 py-5 text-sm text-neutral-200 sm:text-base">
          {order.epost}
        </td>
        <td className="px-4 py-5 text-xs text-neutral-50 sm:text-sm">
          {order.telefon ?? "–"}
        </td>
        <td className="px-4 py-5 text-sm sm:text-base">
          {order.antallDeltakere}
        </td>
        <td className="px-4 py-5 text-sm sm:text-base">
          {formatBelop(order.belop)}
        </td>
        <td className="px-4 py-5">
          <StatusBadge status={order.status} />
        </td>
        <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onDelete(order.id)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-neutral-50 hover:bg-red-500/20 hover:text-red-100 disabled:opacity-50"
            aria-label={`Slett bestilling ${order.navn}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-neutral-900/50">
          <td colSpan={TABLE_COLUMNS} className="px-4 py-4">
            <div className="flex flex-col gap-2 text-sm text-neutral-100 sm:flex-row sm:items-start sm:justify-between sm:text-base">
              <div className="mt-2 space-y-1 text-left sm:mt-0">
                <p className="font-semibold text-neutral-50">
                  {order.turTittel}
                </p>
                <p className="text-neutral-400">
                  Dato: {formatDato(order.dato)}
                </p>
              </div>
              <div className="space-y-1">
                {order.betaltBelop != null &&
                  order.gjenstaendeBelop != null && (
                    <div className="mt-2 flex flex-wrap gap-3 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-2 text-sm">
                      <span>
                        <span className="font-semibold text-neutral-400">
                          Betalt:{" "}
                        </span>
                        <span className="font-bold text-green-200 tabular-nums">
                          {formatBelop(order.betaltBelop)}
                        </span>
                      </span>
                      <span>
                        <span className="font-semibold text-neutral-400">
                          Gjenstår:{" "}
                        </span>
                        <span className="font-bold text-amber-200 tabular-nums">
                          {formatBelop(order.gjenstaendeBelop)}
                        </span>
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Deltakere utover hovedpersonen */}
            {order.participants && order.participants.length > 1 && (
              <div className="mt-4 border-t border-neutral-800 pt-3 text-sm text-neutral-100 sm:text-base">
                <p className="font-semibold text-neutral-50">Flere deltakere</p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {order.participants.slice(1).map((p) => (
                    <div
                      key={`${order.id}-${p.name}-${p.email}`}
                      className="rounded-md bg-neutral-900/60 p-3"
                    >
                      <p className="font-semibold text-neutral-50">{p.name}</p>
                      <p className="text-sm text-neutral-200">{p.email}</p>
                      <p className="text-sm text-neutral-200">
                        {p.telefon ?? "–"}
                      </p>
                      {(p.sos_navn || p.sos_telefon) && (
                        <div className="mt-2 border-t border-neutral-800 pt-2 text-sm">
                          <p className="font-medium text-neutral-50">
                            Nødkontakt
                          </p>
                          <p>
                            <span className="text-neutral-400">Navn:</span>{" "}
                            {p.sos_navn ?? "–"}
                          </p>
                          <p>
                            <span className="text-neutral-400">Telefon:</span>{" "}
                            {p.sos_telefon ?? "–"}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

/** Kortvisning for én bestilling – brukes kun på mobil (< md). */
function OrderCard({
  order,
  onDelete,
  isDeleting,
  waitlistPosition,
}: {
  order: OrderRow;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  waitlistPosition?: number;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {waitlistPosition !== undefined && (
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-400"
                aria-label={`Posisjon ${waitlistPosition} på venteliste`}
                title={`Posisjon ${waitlistPosition} på venteliste`}
              >
                {waitlistPosition}
              </span>
            )}
            <p className="text-base font-semibold text-neutral-50 sm:text-lg">
              {order.navn}
            </p>
          </div>
          <p className="truncate text-xs text-neutral-400 sm:text-sm">
            {order.epost}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-400 sm:text-sm">
        <div>
          <span className="sr-only">Telefon</span>
          <span>{order.telefon ?? "–"}</span>
        </div>
        <div>
          <span className="sr-only">Deltakere</span>
          <span>{order.antallDeltakere}</span>
        </div>
        <div>
          <span className="sr-only">Beløp</span>
          <span>{formatBelop(order.belop)}</span>
        </div>
        <div>
          <span className="sr-only">Dato</span>
          <span>{formatDato(order.dato)}</span>
        </div>
      </dl>

      <p className="text-sm font-medium text-neutral-200 sm:text-base">
        {order.turTittel}
      </p>
      <button
        type="button"
        disabled={isDeleting}
        onClick={() => onDelete(order.id)}
        className="mt-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-neutral-50 hover:bg-red-500/20 hover:text-red-100 disabled:opacity-50"
        aria-label={`Slett bestilling ${order.navn}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden />
      </button>
    </article>
  );
}

export function OrdersView() {
  const [filter, setFilter] = useState<OrdersFilterValue>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const fetchBookings = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getBookingsPage(page, ORDERS_PAGE_SIZE);
      if (result.success) {
        const mappedOrders = result.data.map(mapBookingToOrderRow);
        setOrders(mappedOrders);
        setTotalPages(result.totalPages);
        setCurrentPage(page);
      } else {
        setError("Kunne ikke hente bestillinger. Prøv igjen senere.");
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("En feil oppstod ved henting av bestillinger.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  // Realtime: abonner på bookings og participants, debounced refresh
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;
  const DEBOUNCE_MS = 800;

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const scheduleRefresh = () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = setTimeout(() => {
        refreshTimeoutRef.current = null;
        fetchBookings(currentPageRef.current);
      }, DEBOUNCE_MS);
    };

    const channel = supabase
      .channel("orders-bookings-participants")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => scheduleRefresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        () => scheduleRefresh(),
      )
      .subscribe();

    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [fetchBookings]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchBookings(page);
  };

  const handleDelete = async (id: string) => {
    // Optimistisk oppdatering: fjern bestillingen lokalt med en gang
    setDeletingIds((prev) => new Set(prev).add(id));
    setOrders((prev) => prev.filter((order) => order.id !== id));

    try {
      const formData = new FormData();
      formData.append("id", id);
      await deleteBooking(formData);
      // Ingen eksplisitt fetch her – Supabase Realtime vil trigge en oppdatert fetch
    } catch (err) {
      console.error("Error deleting booking:", err);
      // Ved feil: hent data på nytt for å resynce UI
      await fetchBookings(currentPage);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setIsConfirmingDelete(true);
    try {
      await handleDelete(pendingDeleteId);
      setPendingDeleteId(null);
    } finally {
      setIsConfirmingDelete(false);
    }
  };

  const groupedByTour = useMemo(() => {
    const map = new Map<string, OrderRow[]>();
    for (const order of orders) {
      const key = order.turTittel;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(order);
    }
    // Sorter bookings innenfor hver tur-gruppe:
    // 1. Venteliste først (eldste først = først i køen)
    // 2. Deretter andre statuser (nyeste først)
    return Array.from(map.entries()).map(([turTittel, groupOrders]) => {
      const sorted = [...groupOrders].sort((a, b) => {
        const aIsWaitlist = a.status === "venteliste";
        const bIsWaitlist = b.status === "venteliste";

        // Hvis begge er venteliste: sorter etter dato (eldste først)
        if (aIsWaitlist && bIsWaitlist) {
          return new Date(a.dato).getTime() - new Date(b.dato).getTime();
        }

        // Hvis bare en er venteliste: venteliste først
        if (aIsWaitlist && !bIsWaitlist) return -1;
        if (!aIsWaitlist && bIsWaitlist) return 1;

        // Begge er ikke venteliste: nyeste først
        return new Date(b.dato).getTime() - new Date(a.dato).getTime();
      });
      return [turTittel, sorted] as [string, OrderRow[]];
    });
  }, [orders]);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <OrdersFilterTabs value={filter} onChange={setFilter} />
        <div className="bg-card border-primary/20 flex flex-col items-center justify-center gap-3 rounded-[18px] border px-5 py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" aria-hidden />
          <p className="text-neutral-400">Henter bestillinger...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <OrdersFilterTabs value={filter} onChange={setFilter} />
        <div className="bg-card flex items-center justify-center rounded-[18px] border border-red-500/20 px-5 py-12">
          <p className="text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="space-y-4">
        <OrdersFilterTabs value={filter} onChange={setFilter} />
        <div className="border-b border-neutral-800/80" />
        <SearchInput
          placeholder="Søk etter navn eller e-post"
          className="w-full sm:max-w-xs"
        />
        <div className="bg-card border-primary/20 flex items-center justify-center rounded-[18px] border px-5 py-12">
          <p className="text-neutral-400">Ingen bestillinger funnet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <OrdersFilterTabs value={filter} onChange={setFilter} />
      <div className="border-b border-neutral-800/80" />
      <SearchInput
        placeholder="Søk etter navn eller e-post"
        className="w-full sm:max-w-xs"
      />
      {filter === "tours" ? (
        <div className="space-y-6">
          {groupedByTour.map(([turTittel, groupOrders]) => {
            const first = groupOrders[0];
            const tourDatoRaw = first?.tourDato ?? "–";
            const tourDato =
              tourDatoRaw && tourDatoRaw !== "–"
                ? formatDato(tourDatoRaw)
                : "–";
            const total = first?.tourTotalPlasser ?? 0;
            const ledige = first?.tourLedigePlasser ?? 0;
            const booked = total - ledige;
            const ventelisteCount = groupOrders.filter(
              (o) => o.status === "venteliste",
            ).length;
            const isOverbooked = booked > total && total > 0;
            // Ledige plasser: grønn > 5, gul 1–5, rød 0
            const availabilityTone =
              ledige > 5 ? "green" : ledige > 0 ? "yellow" : "red";

            return (
              <div
                key={turTittel}
                className={`bg-card overflow-hidden rounded-[18px]`}
              >
                <div className="border-b border-neutral-800 px-5 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-neutral-50">
                          {turTittel}
                        </h2>
                        {isOverbooked && (
                          <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                            Overbooked
                          </span>
                        )}
                        {ventelisteCount > 0 && (
                          <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-400">
                            {ventelisteCount} på venteliste
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-neutral-400">
                        {tourDato} · {groupOrders.length} bestilling
                        {groupOrders.length !== 1 ? "er" : ""} · {booked}/
                        {total} plasser
                        {isOverbooked && (
                          <span className="ml-2 font-semibold text-red-400">
                            Overbooked: {booked - total} plasser over kapasitet
                          </span>
                        )}
                        {!isOverbooked && (
                          <span
                            className={`ml-2 font-medium ${
                              availabilityTone === "green"
                                ? "text-green-400"
                                : availabilityTone === "yellow"
                                  ? "text-yellow-400"
                                  : "text-red-400"
                            }`}
                          >
                            {ledige} ledige
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10 inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
                      onClick={() => {
                        const csv = buildBookingsCSV(groupOrders);
                        const filename = `bestillinger-${sanitizeFilename(turTittel)}-${new Date().toISOString().slice(0, 10)}.csv`;
                        downloadCsv(csv, filename);
                      }}
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      <span>Last ned CSV</span>
                    </Button>
                  </div>
                </div>
                {/* Mobil: kortliste */}
                <div className="space-y-3 p-4 md:hidden">
                  {groupOrders.map((order) => {
                    const waitlistPosition =
                      order.status === "venteliste"
                        ? groupOrders
                            .filter((o) => o.status === "venteliste")
                            .indexOf(order) + 1
                        : undefined;
                    return (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onDelete={setPendingDeleteId}
                        isDeleting={deletingIds.has(order.id)}
                        waitlistPosition={waitlistPosition}
                      />
                    );
                  })}
                </div>
                {/* Desktop: tabell med utvidbare rader */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <OrdersTableHeader />
                    <tbody className="divide-y divide-neutral-800">
                      {groupOrders.map((order) => {
                        const waitlistPosition =
                          order.status === "venteliste"
                            ? groupOrders
                                .filter((o) => o.status === "venteliste")
                                .indexOf(order) + 1
                            : undefined;
                        return (
                          <OrderTableRow
                            key={order.id}
                            order={order}
                            isExpanded={expandedOrderId === order.id}
                            onToggle={() =>
                              setExpandedOrderId((id) =>
                                id === order.id ? null : order.id,
                              )
                            }
                            onDelete={setPendingDeleteId}
                            isDeleting={deletingIds.has(order.id)}
                            waitlistPosition={waitlistPosition}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card overflow-hidden rounded-[18px] border border-neutral-800">
          <div className="border-b border-neutral-800 px-5 py-4">
            <h2 className="text-lg font-semibold text-neutral-50">
              Alle bestillinger
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Se og administrer alle bestillinger.
            </p>
          </div>

          {/* Mobil: kortliste */}
          <div className="space-y-3 p-4 md:hidden">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onDelete={setPendingDeleteId}
                isDeleting={deletingIds.has(order.id)}
              />
            ))}
          </div>
          {/* Desktop: tabell med utvidbare rader */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px] text-left text-sm">
              <OrdersTableHeader />
              <tbody className="divide-y divide-neutral-800">
                {orders.map((order) => (
                  <OrderTableRow
                    key={order.id}
                    order={order}
                    isExpanded={expandedOrderId === order.id}
                    onToggle={() =>
                      setExpandedOrderId((id) =>
                        id === order.id ? null : order.id,
                      )
                    }
                    onDelete={setPendingDeleteId}
                    isDeleting={deletingIds.has(order.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Slett bestilling"
        description="Er du sikker på at du vil slette denne bestillingen? Denne handlingen kan ikke angres."
        onClose={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
        confirmLabel="Slett"
        cancelLabel="Avbryt"
        isConfirming={isConfirmingDelete}
      />
    </section>
  );
}
