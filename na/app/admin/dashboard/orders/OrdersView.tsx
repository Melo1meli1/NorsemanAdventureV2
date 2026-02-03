"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_TYPE_LABELS,
} from "@/lib/zod/bookingValidation";
import type { BookingStatus, BookingType } from "@/lib/types";
import { OrdersFilterTabs, type OrdersFilterValue } from "./OrdersFilterTabs";

/** Mock-rad for tabellen (felter som i schema; turTittel for visning). */
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
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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
  },
];

const COLUMNS: { key: keyof OrderRow | "handlinger"; label: string }[] = [
  { key: "navn", label: "Navn" },
  { key: "epost", label: "E-post" },
  { key: "type", label: "Type" },
  { key: "turTittel", label: "Tur/Kurs/Produkt" },
  { key: "belop", label: "Beløp" },
  { key: "status", label: "Status" },
  { key: "dato", label: "Dato" },
  { key: "telefon", label: "Telefonnummer" },
  { key: "handlinger", label: "Handlinger" },
];

export function OrdersView() {
  const [filter, setFilter] = useState<OrdersFilterValue>("all");
  const orders = MOCK_ORDERS;

  return (
    <section className="space-y-4">
      <OrdersFilterTabs value={filter} onChange={setFilter} />

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
            <thead>
              <tr className="border-b border-neutral-800">
                {COLUMNS.map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-4 py-4 font-medium text-neutral-300"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="text-neutral-200 hover:bg-neutral-800/30"
                >
                  <td className="px-4 py-5 font-medium text-neutral-50">
                    {order.navn}
                  </td>
                  <td className="px-4 py-5">{order.epost}</td>
                  <td className="px-4 py-5">
                    {BOOKING_TYPE_LABELS[order.type]}
                  </td>
                  <td className="px-4 py-5">{order.turTittel}</td>
                  <td className="px-4 py-5">{formatBelop(order.belop)}</td>
                  <td className="px-4 py-5">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        order.status === "betalt"
                          ? "bg-green-500/20 text-green-400"
                          : order.status === "venteliste"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : order.status === "kansellert"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-neutral-700 text-neutral-300"
                      }`}
                    >
                      {BOOKING_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-5">{formatDate(order.dato)}</td>
                  <td className="px-4 py-5 text-neutral-400">
                    {order.telefon ?? "–"}
                  </td>
                  <td className="px-4 py-5">
                    <button
                      type="button"
                      onClick={() => {}}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-neutral-400 hover:bg-red-500/20 hover:text-red-400"
                      aria-label={`Slett bestilling ${order.navn}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                      <span>Slett</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
