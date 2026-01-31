// Helper file to make accessing data simpler
import type { Database } from "@/lib/database.types";

// En type for en rad i tabellen
export type Tour = Database["public"]["Tables"]["tours"]["Row"];

// En type for når du skal lage en NY tur
export type TourInsert = Database["public"]["Tables"]["tours"]["Insert"];

// En type for oppdatering (hvor alt er valgfritt)
export type TourUpdate = Database["public"]["Tables"]["tours"]["Update"];

// Enum for status
export type TourStatus = Database["public"]["Enums"]["tour_status"];

/** Én tur i bestillings-handlekurven (brukes i BookingMainContent og OrderSummary) */
export type BookingCartItem = {
  tourId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
};
