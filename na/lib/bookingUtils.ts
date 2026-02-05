import type { Database } from "@/lib/database.types";

// Minimal shape we need from a Supabase client.
type SupabaseClientLike = {
  from: <T extends keyof Database["public"]["Tables"]>(
    table: T,
  ) => ReturnType<
    import("@supabase/supabase-js").SupabaseClient<Database>["from"]
  >;
};

export type RemainingSeatsResult =
  | {
      success: true;
      totalSeats: number;
      confirmedSeats: number;
      remainingSeats: number;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Calculates remaining seats for a tour by subtracting confirmed bookings (paid/partially paid)
 * from the tour's total capacity.
 */
export async function getRemainingSeatsForTour(
  supabase: SupabaseClientLike,
  tourId: string,
): Promise<RemainingSeatsResult> {
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("id, total_seats")
    .eq("id", tourId)
    .single();

  if (tourError || !tour) {
    console.error("Could not fetch tour for availability", tourError);
    return {
      success: false,
      error: "Fant ikke turen. Prøv igjen senere.",
    };
  }

  const { data: confirmedBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id")
    .eq("tour_id", tourId)
    .in("status", ["betalt", "delvis_betalt"]);

  if (bookingsError) {
    console.error("Error fetching bookings for availability", bookingsError);
    return {
      success: false,
      error: "Kunne ikke hente bookinginformasjon. Prøv igjen senere.",
    };
  }

  if (!confirmedBookings || confirmedBookings.length === 0) {
    const totalSeats = tour.total_seats;
    return {
      success: true,
      totalSeats,
      confirmedSeats: 0,
      remainingSeats: totalSeats,
    };
  }

  const bookingIds = confirmedBookings.map((b: { id: string }) => b.id);

  const { count: participantsCount, error: participantsError } = await supabase
    .from("participants")
    .select("id", { head: true, count: "exact" })
    .in("booking_id", bookingIds);

  if (participantsError) {
    console.error(
      "Error counting participants for availability",
      participantsError,
    );
    return {
      success: false,
      error: "Kunne ikke hente deltakerinformasjon. Prøv igjen senere.",
    };
  }

  const confirmedSeats = participantsCount ?? 0;
  const remainingSeats = Math.max(0, tour.total_seats - confirmedSeats);

  return {
    success: true,
    totalSeats: tour.total_seats,
    confirmedSeats,
    remainingSeats,
  };
}
