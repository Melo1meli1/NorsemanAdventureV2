import type { Tour } from "@/lib/types";

/** Formater pris med mellomrom som tusenskiller (kr 35 000) */
export function formatPrice(price: number): string {
  return `kr ${Math.round(price).toLocaleString("nb-NO")}`;
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
  nybegynner: "enkel",
  intermediær: "middels",
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
