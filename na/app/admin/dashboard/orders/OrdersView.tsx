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
  /** Nødkontakt – kun i CSV-eksport, ikke vist i admin-tabellen. */
  sos_navn?: string | null;
  sos_telefon?: string | null;
  /**
   * Valgfritt: hvor mye som allerede er betalt, og hvor mye som gjenstår.
   * Disse feltene kan senere fylles fra LetsReg/backend.
   */
  betaltBelop?: number | null;
  gjenstaendeBelop?: number | null;
};

function formatBelop(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  }).format(n);
}

/** Bygg CSV-streng for en liste bestillinger (tabellkolonner + dato + SOS-kontakt). */
function buildBookingsCSV(orders: OrderRow[]): string {
  const header = [
    "Navn",
    "E-post",
    "Telefon",
    "Deltakere",
    "Beløp",
    "Status",
    "Dato",
    "Nødkontakt navn",
    "Nødkontakt telefon",
  ];
  const rows = orders.map((order) => [
    escapeCsvField(order.navn),
    escapeCsvField(order.epost),
    escapeCsvField(order.telefon ?? ""),
    String(order.antallDeltakere),
    escapeCsvField(formatBelop(order.belop)),
    escapeCsvField(BOOKING_STATUS_LABELS[order.status]),
    escapeCsvField(order.dato),
    escapeCsvField(order.sos_navn ?? ""),
    escapeCsvField(order.sos_telefon ?? ""),
  ]);
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
  },
];

function StatusBadge({ status }: { status: OrderRow["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        status === "betalt"
          ? "border border-green-500/40 bg-green-500/15 text-green-400"
          : status === "delvis_betalt"
            ? "border border-orange-500/40 bg-orange-500/15 text-orange-300"
            : status === "ikke_betalt"
              ? "border border-red-500/40 bg-red-600/15 text-red-400"
              : status === "venteliste"
                ? "bg-yellow-500/20 text-yellow-400"
                : status === "kansellert"
                  ? "bg-neutral-700 text-neutral-300"
                  : "bg-neutral-700 text-neutral-300"
      }`}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

function OrderTableRow({ order }: { order: OrderRow }) {
  return (
    <tr className="text-sm text-neutral-200 hover:bg-neutral-800/30 sm:text-base">
      <td className="px-4 py-5 font-semibold text-neutral-50">{order.navn}</td>
      <td className="px-4 py-5 text-sm text-neutral-200 sm:text-base">
        {order.epost}
      </td>
      <td className="px-4 py-5 text-xs text-neutral-400 sm:text-sm">
        {order.telefon ?? "–"}
      </td>
      <td className="px-4 py-5 text-sm sm:text-base">
        {order.antallDeltakere}
      </td>
      <td className="px-4 py-5 text-sm sm:text-base">
        {formatBelop(order.belop)}
      </td>
      <td className="px-4 py-5">
        <div className="flex flex-col gap-1">
          <StatusBadge status={order.status} />
          {order.betaltBelop != null && order.gjenstaendeBelop != null && (
            <div className="text-[11px] text-neutral-400 sm:text-xs">
              <p>Betalt: {formatBelop(order.betaltBelop)}</p>
              <p>Gjenstår: {formatBelop(order.gjenstaendeBelop)}</p>
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-5">
        <form
          action={async (formData) => {
            await deleteBooking(formData);
          }}
          className="inline-block"
        >
          <input type="hidden" name="id" value={order.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-neutral-400 hover:bg-red-500/20 hover:text-red-400"
            aria-label={`Slett bestilling ${order.navn}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            <span>Slett</span>
          </button>
        </form>
      </td>
    </tr>
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
          <span>{order.dato}</span>
        </div>
      </dl>
      {order.betaltBelop != null && order.gjenstaendeBelop != null && (
        <div className="mt-1 text-xs text-neutral-400 sm:text-sm">
          <p>Betalt: {formatBelop(order.betaltBelop)}</p>
          <p>Gjenstår: {formatBelop(order.gjenstaendeBelop)}</p>
        </div>
      )}
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
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-neutral-400 hover:bg-red-500/20 hover:text-red-400"
          aria-label={`Slett bestilling ${order.navn}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Slett
        </button>
      </form>
    </article>
  );
}

export function OrdersView() {
  const [filter, setFilter] = useState<OrdersFilterValue>("all");
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
            const tourDato = first?.tourDato ?? "–";
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
                {/* Desktop: tabell */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <OrdersTableHeader />
                    <tbody className="divide-y divide-neutral-800">
                      {groupOrders.map((order) => (
                        <OrderTableRow key={order.id} order={order} />
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
          {/* Desktop: tabell */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[800px] text-left text-sm">
              <OrdersTableHeader />
              <tbody className="divide-y divide-neutral-800">
                {orders.map((order) => (
                  <OrderTableRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
