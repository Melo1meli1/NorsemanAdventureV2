"use client";

import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { BOOKING_STATUS_LABELS } from "@/lib/zod/bookingValidation";
import type { BookingStatus, BookingType } from "@/lib/types";
import {
  buildCsv,
  downloadCsv,
  escapeCsvField,
  sanitizeFilename,
} from "@/lib/csvUtils";
import { deleteBooking } from "../actions/bookings";
import { Button } from "@/components/ui/button";
import { OrdersFilterTabs, type OrdersFilterValue } from "./OrdersFilterTabs";
import { OrdersTableHeader } from "./OrdersTableHeader";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  telefon: string | null;
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
    telefon: string | null;
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

const MOCK_ORDERS: OrderRow[] = [
  {
    id: "1",
    navn: "Ole Nordmann",
    epost: "ole.nordmann@example.com",
    type: "tur",
    turTittel: "Nordkapp Ekspedisjon",
    belop: 12500,
    status: "venteliste",
    dato: "2026-01-15",
    telefon: "98765432",
    antallDeltakere: 1,
    tourDato: "2025-06-15",
    tourTotalPlasser: 12,
    tourLedigePlasser: 9,
    sos_navn: "Ingrid Nordmann",
    sos_telefon: "12345678",
    participants: [
      {
        name: "Ole Nordmann",
        email: "ole.nordmann@example.com",
        telefon: "98765432",
        sos_navn: "Ingrid Nordmann",
        sos_telefon: "12345678",
      },
    ],
  },
  {
    id: "2",
    navn: "Kari Hansen",
    epost: "kari.hansen@example.com",
    type: "tur",
    turTittel: "Nordkapp Ekspedisjon",
    belop: 12500,
    status: "delvis_betalt",
    dato: "2026-01-14",
    telefon: "+47 123 45 678",
    antallDeltakere: 2,
    tourDato: "2025-06-15",
    tourTotalPlasser: 12,
    tourLedigePlasser: 9,
    sos_navn: "Lars Hansen",
    sos_telefon: "+47 876 54 321",
    betaltBelop: 6000,
    gjenstaendeBelop: 6500,
    participants: [
      {
        name: "Kari Hansen",
        email: "kari.hansen@example.com",
        telefon: "+47 123 45 678",
        sos_navn: "Lars Hansen",
        sos_telefon: "+47 876 54 321",
      },
      {
        name: "Per Hansen",
        email: "per.hansen@example.com",
        telefon: "+47 999 88 777",
        sos_navn: "Siv Hansen",
        sos_telefon: "+47 111 22 333",
      },
      {
        name: "Per Hansen",
        email: "per.hansen@example.com",
        telefon: "+47 999 88 777",
        sos_navn: "Siv Hansen",
        sos_telefon: "+47 111 22 333",
      },
    ],
  },
  {
    id: "3",
    navn: "Per Olsen",
    epost: "per.olsen@example.com",
    type: "tur",
    turTittel: "Grusveiene i Setesdal",
    belop: 8900,
    status: "ikke_betalt",
    dato: "2026-01-20",
    telefon: null,
    antallDeltakere: 1,
    tourDato: "2025-07-10",
    tourTotalPlasser: 8,
    tourLedigePlasser: 7,
    sos_navn: "Maria Olsen",
    sos_telefon: "11223344",
    participants: [
      {
        name: "Per Olsen",
        email: "per.olsen@example.com",
        telefon: null,
        sos_navn: "Maria Olsen",
        sos_telefon: "11223344",
      },
    ],
  },
  {
    id: "4",
    navn: "Anna Larsen",
    epost: "anna.larsen@example.com",
    type: "tur",
    turTittel: "Nordkapp Ekspedisjon",
    belop: 12500,
    status: "venteliste",
    dato: "2026-01-18",
    telefon: "456 78 901",
    antallDeltakere: 1,
    tourDato: "2025-06-15",
    tourTotalPlasser: 12,
    tourLedigePlasser: 9,
    sos_navn: null,
    sos_telefon: null,
    participants: [
      {
        name: "Anna Larsen",
        email: "anna.larsen@example.com",
        telefon: "456 78 901",
        sos_navn: null,
        sos_telefon: null,
      },
    ],
  },
];

function StatusBadge({ status }: { status: OrderRow["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${
        status === "betalt"
          ? "border border-green-600/60 bg-green-700 text-green-200"
          : status === "delvis_betalt"
            ? "border border-amber-600/70 bg-amber-700 text-amber-100"
            : status === "ikke_betalt"
              ? "border border-red-600/70 bg-red-800 text-red-100"
              : status === "venteliste"
                ? "border border-sky-600/60 bg-sky-800 text-sky-100"
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
}: {
  order: OrderRow;
  isExpanded: boolean;
  onToggle: () => void;
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
          <form
            action={async (formData) => {
              await deleteBooking(formData);
            }}
            className="inline-block"
          >
            <input type="hidden" name="id" value={order.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-neutral-50 hover:bg-red-500/20 hover:text-red-100"
              aria-label={`Slett bestilling ${order.navn}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </form>
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
function OrderCard({ order }: { order: OrderRow }) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-neutral-50 sm:text-lg">
            {order.navn}
          </p>
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
      <form
        action={async (formData) => {
          await deleteBooking(formData);
        }}
        className="mt-1"
      >
        <input type="hidden" name="id" value={order.id} />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-neutral-50 hover:bg-red-500/20 hover:text-red-100"
          aria-label={`Slett bestilling ${order.navn}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </article>
  );
}

export function OrdersView() {
  const [filter, setFilter] = useState<OrdersFilterValue>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const orders = MOCK_ORDERS;

  const groupedByTour = useMemo(() => {
    const map = new Map<string, OrderRow[]>();
    for (const order of orders) {
      const key = order.turTittel;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(order);
    }
    return Array.from(map.entries());
  }, [orders]);

  return (
    <section className="space-y-4">
      <OrdersFilterTabs value={filter} onChange={setFilter} />

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
            return (
              <div
                key={turTittel}
                className="bg-card overflow-hidden rounded-[18px] border border-neutral-800"
              >
                <div className="border-b border-neutral-800 px-5 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-neutral-50">
                        {turTittel}
                      </h2>
                      <p className="mt-1 text-sm text-neutral-400">
                        {tourDato} · {groupOrders.length} bestilling
                        {groupOrders.length !== 1 ? "er" : ""} · {booked}/
                        {total} plasser
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
                  {groupOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
                {/* Desktop: tabell med utvidbare rader */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <OrdersTableHeader />
                    <tbody className="divide-y divide-neutral-800">
                      {groupOrders.map((order) => (
                        <OrderTableRow
                          key={order.id}
                          order={order}
                          isExpanded={expandedOrderId === order.id}
                          onToggle={() =>
                            setExpandedOrderId((id) =>
                              id === order.id ? null : order.id,
                            )
                          }
                        />
                      ))}
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
              <OrderCard key={order.id} order={order} />
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
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
