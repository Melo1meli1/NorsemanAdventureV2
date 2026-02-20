import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/database.types";

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
  supabase: SupabaseClient<Database>,
  tourId: string,
): Promise<RemainingSeatsResult> {
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("id, seats_available, total_seats")
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

  const { count: activeReservationsCount, error: reservationsError } =
    await supabase
      .from("bookings")
      .select("id", { head: true, count: "exact" })
      .eq("tour_id", tourId)
      .eq("status", "ikke_betalt")
      .gt("reservation_expires_at", new Date().toISOString());

  if (bookingsError) {
    console.error("Error fetching bookings for availability", bookingsError);
    return {
      success: false,
      error: "Kunne ikke hente bookinginformasjon. Prøv igjen senere.",
    };
  }

  if (reservationsError) {
    console.error(
      "Error fetching reservations for availability",
      reservationsError,
    );
    return {
      success: false,
      error: "Kunne ikke hente reservasjoner. Prøv igjen senere.",
    };
  }

  if (!confirmedBookings || confirmedBookings.length === 0) {
    const totalSeats = tour.total_seats;
    const remainingSeats =
      typeof (tour as { seats_available?: number }).seats_available === "number"
        ? (tour as { seats_available: number }).seats_available
        : totalSeats;

    const reserved = activeReservationsCount ?? 0;

    return {
      success: true,
      totalSeats,
      confirmedSeats: 0,
      remainingSeats: Math.max(0, remainingSeats - reserved),
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
  const reservedSeats = activeReservationsCount ?? 0;
  const remainingSeats = Math.max(
    0,
    tour.total_seats - confirmedSeats - reservedSeats,
  );

  return {
    success: true,
    totalSeats: tour.total_seats,
    confirmedSeats,
    remainingSeats,
  };
}

/**
 * Henter ledige plasser for flere turer i én batch (færre rundturer til DB).
 * Returnerer Map<tourId, remainingSeats>.
 */
export async function getRemainingSeatsForTours(
  supabase: SupabaseClient<Database>,
  tourIds: string[],
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  const uniqueIds = [...new Set(tourIds)].filter(Boolean);
  if (uniqueIds.length === 0) return result;

  const { data: tours, error: tourError } = await supabase
    .from("tours")
    .select("id, total_seats, seats_available")
    .in("id", uniqueIds);

  if (tourError || !tours?.length) {
    uniqueIds.forEach((id) => result.set(id, 0));
    return result;
  }

  const { data: confirmedBookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id, tour_id")
    .in("tour_id", uniqueIds)
    .in("status", ["betalt", "delvis_betalt"]);

  const { data: activeReservations, error: reservationsError } = await supabase
    .from("bookings")
    .select("tour_id")
    .in("tour_id", uniqueIds)
    .eq("status", "ikke_betalt")
    .gt("reservation_expires_at", new Date().toISOString());

  if (bookingsError || !confirmedBookings?.length) {
    tours.forEach((t) =>
      result.set(
        t.id,
        Math.max(
          0,
          (t as { seats_available?: number }).seats_available ?? t.total_seats,
        ),
      ),
    );

    if (!reservationsError && activeReservations?.length) {
      const reservedByTourId = new Map<string, number>();
      for (const r of activeReservations) {
        const tid = (r as { tour_id: string }).tour_id;
        reservedByTourId.set(tid, (reservedByTourId.get(tid) ?? 0) + 1);
      }
      for (const t of tours) {
        const current = result.get(t.id) ?? 0;
        const reserved = reservedByTourId.get(t.id) ?? 0;
        result.set(t.id, Math.max(0, current - reserved));
      }
    }

    return result;
  }

  const bookingIds = confirmedBookings.map((b: { id: string }) => b.id);
  const { data: participantRows, error: participantsError } = await supabase
    .from("participants")
    .select("booking_id")
    .in("booking_id", bookingIds);

  const countByBookingId = new Map<string, number>();
  if (!participantsError && participantRows) {
    for (const row of participantRows) {
      const bid = (row as { booking_id: string }).booking_id;
      countByBookingId.set(bid, (countByBookingId.get(bid) ?? 0) + 1);
    }
  }

  const confirmedByTourId = new Map<string, number>();
  for (const b of confirmedBookings) {
    const tid = (b as { tour_id: string }).tour_id;
    const count = countByBookingId.get(b.id) ?? 0;
    confirmedByTourId.set(tid, (confirmedByTourId.get(tid) ?? 0) + count);
  }

  const reservedByTourId = new Map<string, number>();
  if (!reservationsError && activeReservations?.length) {
    for (const r of activeReservations) {
      const tid = (r as { tour_id: string }).tour_id;
      reservedByTourId.set(tid, (reservedByTourId.get(tid) ?? 0) + 1);
    }
  }

  for (const t of tours) {
    const total = t.total_seats;
    const confirmed = confirmedByTourId.get(t.id) ?? 0;
    const reserved = reservedByTourId.get(t.id) ?? 0;
    result.set(t.id, Math.max(0, total - confirmed - reserved));
  }
  uniqueIds.forEach((id) => {
    if (!result.has(id)) result.set(id, 0);
  });
  return result;
}

export type WaitlistBooking = Tables<"bookings">;

export type WaitlistResult =
  | { success: true; bookings: WaitlistBooking[] }
  | { success: false; error: string };

/**
 * Hent ventelisten for en tur, sortert etter created_at (eldst først).
 */
export async function getWaitlistForTour(
  supabase: SupabaseClient<Database>,
  tourId: string,
): Promise<WaitlistResult> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("tour_id", tourId)
    .eq("status", "venteliste")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching waitlist for tour", error);
    return {
      success: false,
      error: "Kunne ikke hente venteliste. Prøv igjen senere.",
    };
  }

  return { success: true, bookings: data ?? [] };
}

export type FirstWaitlistEntryResult =
  | { success: true; booking: WaitlistBooking | null }
  | { success: false; error: string };

/**
 * Hent første i venteliste-køen for en tur (eldst created_at).
 */
export async function getFirstWaitlistEntryForTour(
  supabase: SupabaseClient<Database>,
  tourId: string,
): Promise<FirstWaitlistEntryResult> {
  const waitlist = await getWaitlistForTour(supabase, tourId);
  if (!waitlist.success) {
    return waitlist;
  }

  const [first] = waitlist.bookings;
  return { success: true, booking: first ?? null };
}
