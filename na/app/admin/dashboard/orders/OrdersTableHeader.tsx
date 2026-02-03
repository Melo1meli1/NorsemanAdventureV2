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
          <th key={label} className="px-4 py-4 font-medium text-neutral-300">
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
