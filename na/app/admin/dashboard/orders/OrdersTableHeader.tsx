"use client";

const COLUMNS = [
  "Navn",
  "E-post",
  "Telefon",
  "Deltakere",
  "Beløp",
  "Status",
  "Handlinger",
] as const;

export function OrdersTableHeader() {
  return (
    <thead>
      <tr className="border-b border-neutral-800">
        {COLUMNS.map((label) => (
          <th
            key={label}
            className="px-4 py-4 text-xs font-semibold tracking-wide text-neutral-400 uppercase sm:text-sm"
          >
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
