"use client";

import { useMemo, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { BOOKING_STATUS_LABELS } from "@/lib/zod/bookingValidation";
import type { BookingStatus, BookingType } from "@/lib/types";
import { deleteBooking } from "../actions/bookings";
import { Button } from "@/components/ui/button";
import { OrdersFilterTabs, type OrdersFilterValue } from "./OrdersFilterTabs";
import { OrdersTableHeader } from "./OrdersTableHeader";

/** Mock-rad for tabellen (felter som i schema; turTittel + tur-meta for gruppert visning). */
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
};

function formatBelop(n: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  }).format(n);
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
  },
  {
    id: "2",
    navn: "Kari Hansen",
    epost: "kari.hansen@example.com",
    type: "tur",
    turTittel: "Nordkapp Ekspedisjon",
    belop: 12500,
    status: "betalt",
    dato: "2026-01-14",
    telefon: "+47 123 45 678",
    antallDeltakere: 2,
    tourDato: "2025-06-15",
    tourTotalPlasser: 12,
    tourLedigePlasser: 9,
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
  },
];

function StatusBadge({ status }: { status: OrderRow["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        status === "betalt"
          ? "bg-green-500/20 text-green-400"
          : status === "venteliste"
            ? "bg-yellow-500/20 text-yellow-400"
            : status === "kansellert"
              ? "bg-red-500/20 text-red-400"
              : "bg-neutral-700 text-neutral-300"
      }`}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

function OrderTableRow({ order }: { order: OrderRow }) {
  return (
    <tr className="text-neutral-200 hover:bg-neutral-800/30">
      <td className="px-4 py-5 font-medium text-neutral-50">{order.navn}</td>
      <td className="px-4 py-5">{order.epost}</td>
      <td className="px-4 py-5 text-neutral-400">{order.telefon ?? "–"}</td>
      <td className="px-4 py-5">{order.antallDeltakere}</td>
      <td className="px-4 py-5">{formatBelop(order.belop)}</td>
      <td className="px-4 py-5">
        <StatusBadge status={order.status} />
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
                  <div className="flex items-start justify-between gap-4">
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
                      className="border-primary text-primary hover:bg-primary/10 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
                    >
                      <Download className="h-4 w-4" aria-hidden />
                      <span>Last ned CSV</span>
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
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
          <div className="overflow-x-auto">
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
