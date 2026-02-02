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

// Booking- og deltaker-typer (fra database.types)
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type BookingType = Database["public"]["Enums"]["booking_type"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];
export type Participant = Database["public"]["Tables"]["participants"]["Row"];
export type ParticipantInsert =
  Database["public"]["Tables"]["participants"]["Insert"];

/** Én tur i bestillings-handlekurven (brukes i BookingMainContent og OrderSummary) */
export type BookingCartItem = {
  tourId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
};
