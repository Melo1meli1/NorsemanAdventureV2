/**
 * Generisk CSV-hjelp for eksport og nedlasting.
 */

/** Escape en verdi for CSV (komma, newline, anførselstegn). */
export function escapeCsvField(value: string): string {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Filnavn-sikker streng (fjern tegn som er uønsket i filnavn). */
export function sanitizeFilename(name: string): string {
  return (
    name
      .replace(/[^\p{L}\p{N}\s_\-]/gu, "")
      .replace(/\s+/g, "-")
      .trim() || "fil"
  );
}

/** Trigger nedlasting av en CSV-fil i nettleseren (UTF-8 med BOM). */
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Bygg CSV-streng fra header og rader (alle celler bør være escaped). */
export function buildCsv(header: string[], rows: string[][]): string {
  const lines = [header.join(","), ...rows.map((r) => r.join(","))];
  return lines.join("\n");
}
