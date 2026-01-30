import type { Tour } from "@/lib/types";

/** Formater pris med mellomrom som tusenskiller (kr 35 000) */
export function formatPrice(price: number): string {
  return `kr ${Math.round(price).toLocaleString("nb-NO")}`;
}

/** Startdato formatert for visning (dd.MM.åååå) */
export function formatStartDate(dateString: string): string {
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/** Antall dager mellom start_date og end_date */
export function getTourDays(
  tour: Pick<Tour, "start_date" | "end_date">,
): number {
  const start = new Date(tour.start_date).getTime();
  const end = tour.end_date ? new Date(tour.end_date).getTime() : start;
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

const TERRENG_LABEL: Record<NonNullable<Tour["terreng"]>, string> = {
  asfalt: "Asfalt",
  grus: "Grus",
  blandet: "Blandet",
};

const VANSKELIGHETSGRAD_LABEL: Record<
  NonNullable<Tour["vanskelighetsgrad"]>,
  string
> = {
  nybegynner: "nybegynner",
  intermediær: "intermediær",
  erfaren: "erfaren",
  ekspert: "ekspert",
};

export function getTerrengLabel(terreng: Tour["terreng"]): string | null {
  return terreng ? TERRENG_LABEL[terreng] : null;
}

export function getVanskelighetsgradLabel(
  vanskelighetsgrad: Tour["vanskelighetsgrad"],
): string | null {
  return vanskelighetsgrad ? VANSKELIGHETSGRAD_LABEL[vanskelighetsgrad] : null;
}

const SESONG_LABEL: Record<NonNullable<Tour["sesong"]>, string> = {
  sommer: "Sommertur",
  vinter: "Vintertur",
};

export function getSesongLabel(sesong: Tour["sesong"]): string | null {
  return sesong ? SESONG_LABEL[sesong] : null;
}

/** Hoydepunkter lagres som tekst (f.eks. newline-separert). Returnerer liste for visning. */
export function parseHoydepunkter(hoydepunkter: string | null): string[] {
  if (!hoydepunkter || !hoydepunkter.trim()) return [];
  return hoydepunkter
    .split(/[\r\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Placeholder-bilde når tour ikke har image_url */
export function getTourImageUrl(
  tour: Pick<Tour, "image_url" | "terreng">,
): string {
  if (tour.image_url) return tour.image_url;
  const fallbacks: Record<string, string> = {
    asfalt: "/tour-asphalt.jpg",
    grus: "/tour-gravel.jpg",
    blandet: "/tour-summer.jpg",
  };
  return fallbacks[tour.terreng ?? "blandet"] ?? "/tour-summer.jpg";
}
