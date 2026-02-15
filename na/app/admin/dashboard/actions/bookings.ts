"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/supabase-server";
import {
  getRemainingSeatsForTour,
  getRemainingSeatsForTours,
} from "@/lib/bookingUtils";
import type { Booking, Participant, Tour } from "@/lib/types";
import {
  adminBookingFormSchema,
  type AdminBookingFormValues,
} from "@/lib/zod/bookingValidation";

export type BookingWithDetails = Booking & {
  tour: Tour | null;
  participants: Participant[];
  antallDeltakere: number;
  tourTittel: string;
  tourDato: string | null;
  tourTotalPlasser: number | null;
  tourLedigePlasser: number | null;
};

export type BookingStats = {
  totaleBestillinger: number;
  bekreftet: number;
  venteliste: number;
  ledigePlasser: number;
  aktiveTurer: number;
};

export async function deleteBooking(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return {
      success: false as const,
      error: "Ugyldig booking-id.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    return {
      success: false as const,
      error:
        "Kunne ikke slette bestilling. Vennligst prøv igjen senere eller kontakt administrator.",
    };
  }

  //note: bookings have cascaade turned on, participants will be automatically delete.

  revalidatePath("/admin/dashboard/orders");
  return {
    success: true as const,
  };
}

export type UpdateBookingResult =
  | { success: true }
  | { success: false; error: string };

export async function updateBooking(
  id: string,
  input: AdminBookingFormValues,
): Promise<UpdateBookingResult> {
  const parsed = adminBookingFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().formErrors[0] ?? "Ugyldig skjemadata.",
    };
  }

  const data = parsed.data;
  const participants = (data.participants ?? []).filter((p) =>
    [p.name, p.email, p.telefon, p.sos_navn, p.sos_telefon].every(
      (s) => typeof s === "string" && s.trim() !== "",
    ),
  );

  const supabase = await createClient();

  const datoStr =
    data.dato instanceof Date
      ? data.dato.toISOString().slice(0, 10)
      : new Date(data.dato).toISOString().slice(0, 10);

  const betaltBelop =
    data.status === "delvis_betalt" && data.betalt_belop != null
      ? data.betalt_belop
      : null;

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      navn: data.navn.trim(),
      epost: data.epost.trim(),
      dato: datoStr,
      status: data.status,
      belop: data.belop,
      betalt_belop: betaltBelop,
      type: data.type ?? "tur",
      tour_id: data.tour_id ?? null,
      telefon: data.telefon.trim(),
      notater: data.notater ?? null,
    })
    .eq("id", id);

  if (updateError) {
    return {
      success: false,
      error: updateError.message ?? "Kunne ikke oppdatere bestilling.",
    };
  }

  const { error: deletePartsError } = await supabase
    .from("participants")
    .delete()
    .eq("booking_id", id);

  if (deletePartsError) {
    return {
      success: false,
      error: deletePartsError.message ?? "Kunne ikke oppdatere deltakere.",
    };
  }

  if (participants.length > 0) {
    const participantRows = participants.map((p) => ({
      booking_id: id,
      name: p.name.trim(),
      email: p.email.trim(),
      telefon: p.telefon.trim(),
      sos_navn: p.sos_navn.trim(),
      sos_telefon: p.sos_telefon.trim(),
    }));

    const { error: insertError } = await supabase
      .from("participants")
      .insert(participantRows);

    if (insertError) {
      return {
        success: false,
        error: insertError.message ?? "Kunne ikke lagre deltakere.",
      };
    }
  }

  revalidatePath("/admin/dashboard/orders");
  return { success: true };
}

const DEFAULT_PAGE_SIZE = 10;

/**
 * Henter en side med bookings (med participants og tour-info) og totalt antall for paginering.
 */
export async function getBookingsPage(
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
  searchTerm?: string,
  filter?: string,
): Promise<{
  success: true;
  data: BookingWithDetails[];
  totalCount: number;
  totalPages: number;
}> {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const hasSearch = !!(searchTerm && searchTerm.trim().length > 0);

  let query = supabase
    .from("bookings")
    .select(
      `
      *,
      tours (
        id,
        title,
        start_date,
        total_seats
      )
    `,
      { count: hasSearch ? "planned" : "exact" },
    )
    .order("created_at", { ascending: false });

  if (hasSearch) {
    const term = searchTerm!.trim();
    // Søk kun i navn og e-post (case-insensitive, partial match)
    query = query.or(`navn.ilike.%${term}%,epost.ilike.%${term}%`);
  }

  const {
    data: bookings,
    error: bookingsError,
    count,
  } = await query.range(from, to);

  if (bookingsError) {
    console.error("Error fetching bookings page:", bookingsError);
    return {
      success: true,
      data: [],
      totalCount: 0,
      totalPages: 0,
    };
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (!bookings || bookings.length === 0) {
    return {
      success: true,
      data: [],
      totalCount,
      totalPages,
    };
  }

  const bookingIds = bookings.map((b) => b.id);

  const tourIds =
    !hasSearch && filter === "tours"
      ? [
          ...new Set(
            bookings
              .map((b) => b.tour_id)
              .filter((id): id is string => id != null),
          ),
        ]
      : [];

  const participantsPromise = supabase
    .from("participants")
    .select("*")
    .in("booking_id", bookingIds);

  const remainingSeatsPromise =
    tourIds.length > 0 ? getRemainingSeatsForTours(supabase, tourIds) : null;

  const participantsResult = await participantsPromise;
  const remainingByTourId =
    remainingSeatsPromise !== null
      ? await remainingSeatsPromise
      : new Map<string, number>();

  const { data: participants, error: participantsError } = participantsResult;
  if (participantsError) {
    console.error("Error fetching participants:", participantsError);
  }

  const participantsByBookingId = new Map<string, Participant[]>();
  if (participants) {
    for (const participant of participants) {
      const existing =
        participantsByBookingId.get(participant.booking_id) || [];
      existing.push(participant);
      participantsByBookingId.set(participant.booking_id, existing);
    }
  }

  const bookingsWithDetails: BookingWithDetails[] = bookings.map((booking) => {
    const bookingWithTours = booking as unknown as {
      tours: Tour | Tour[] | null;
    };
    const toursData = bookingWithTours.tours;

    let tour: Tour | null = null;
    if (toursData) {
      if (Array.isArray(toursData)) {
        tour = toursData.length > 0 ? toursData[0] : null;
      } else {
        tour = toursData;
      }
    }

    const bookingParticipants = participantsByBookingId.get(booking.id) || [];
    const tourLedigePlasser =
      booking.tour_id != null
        ? (remainingByTourId.get(booking.tour_id) ?? null)
        : null;

    return {
      ...booking,
      tour,
      participants: bookingParticipants,
      antallDeltakere: bookingParticipants.length,
      tourTittel: tour?.title ?? "Ukjent tur",
      tourDato: tour?.start_date ?? null,
      tourTotalPlasser: tour?.total_seats ?? null,
      tourLedigePlasser,
    };
  });

  return {
    success: true,
    data: bookingsWithDetails,
    totalCount,
    totalPages,
  };
}

/**
 * Henter alle bookings med participants og tour-info (uten paginering).
 */
export async function getAllBookingsWithParticipants(): Promise<{
  success: true;
  data: BookingWithDetails[];
}> {
  const supabase = await createClient();

  // Hent alle bookings med tour-info
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      `
      *,
      tours (
        id,
        title,
        start_date,
        total_seats
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError);
    return {
      success: true,
      data: [],
    };
  }

  if (!bookings || bookings.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  // Hent alle participants for alle bookings
  const bookingIds = bookings.map((b) => b.id);
  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("*")
    .in("booking_id", bookingIds);

  if (participantsError) {
    console.error("Error fetching participants:", participantsError);
  }

  // Grupper participants per booking
  const participantsByBookingId = new Map<string, Participant[]>();
  if (participants) {
    for (const participant of participants) {
      const existing =
        participantsByBookingId.get(participant.booking_id) || [];
      existing.push(participant);
      participantsByBookingId.set(participant.booking_id, existing);
    }
  }

  // Beregn ledige plasser for hver tur
  const tourAvailabilityCache = new Map<string, number | null>();

  // Mappe bookings til BookingWithDetails
  const bookingsWithDetails: BookingWithDetails[] = await Promise.all(
    bookings.map(async (booking) => {
      // Supabase returnerer tours som en array når man bruker select med relasjoner
      // Hvis det er en one-to-many relasjon, kan det være en array, men vi forventer én tour
      const bookingWithTours = booking as unknown as {
        tours: Tour | Tour[] | null;
      };
      const toursData = bookingWithTours.tours;

      let tour: Tour | null = null;
      if (toursData) {
        if (Array.isArray(toursData)) {
          tour = toursData.length > 0 ? toursData[0] : null;
        } else {
          tour = toursData;
        }
      }

      const bookingParticipants = participantsByBookingId.get(booking.id) || [];

      let tourLedigePlasser: number | null = null;

      if (booking.tour_id && tour) {
        // Cache ledige plasser per tur
        if (!tourAvailabilityCache.has(booking.tour_id)) {
          const availability = await getRemainingSeatsForTour(
            supabase,
            booking.tour_id,
          );
          tourLedigePlasser = availability.success
            ? availability.remainingSeats
            : null;
          tourAvailabilityCache.set(booking.tour_id, tourLedigePlasser);
        } else {
          tourLedigePlasser =
            tourAvailabilityCache.get(booking.tour_id) ?? null;
        }
      }

      return {
        ...booking,
        tour,
        participants: bookingParticipants,
        antallDeltakere: bookingParticipants.length,
        tourTittel: tour?.title ?? "Ukjent tur",
        tourDato: tour?.start_date ?? null,
        tourTotalPlasser: tour?.total_seats ?? null,
        tourLedigePlasser,
      };
    }),
  );

  return {
    success: true,
    data: bookingsWithDetails,
  };
}

/**
 * Henter bookings gruppert per tur.
 */
export async function getBookingsByTour(): Promise<{
  success: true;
  data: Map<string, BookingWithDetails[]>;
}> {
  const result = await getAllBookingsWithParticipants();

  const grouped = new Map<string, BookingWithDetails[]>();
  for (const booking of result.data) {
    const key = booking.tourTittel;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(booking);
  }

  return {
    success: true,
    data: grouped,
  };
}

const EMPTY_STATS: BookingStats = {
  totaleBestillinger: 0,
  bekreftet: 0,
  venteliste: 0,
  ledigePlasser: 0,
  aktiveTurer: 0,
};

/**
 * Henter booking-statistikk for KPI-kortene.
 */
export async function getBookingStats(): Promise<{
  success: true;
  data: BookingStats;
}> {
  try {
    const supabase = await createClient();

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, status, tour_id")
      .neq("status", "kansellert");

    if (bookingsError) {
      console.error("Error fetching bookings for stats:", bookingsError);
      return { success: true, data: EMPTY_STATS };
    }

    const totaleBestillinger = bookings?.length ?? 0;
    const bekreftet =
      bookings?.filter((b) => b.status === "betalt").length ?? 0;
    const venteliste =
      bookings?.filter((b) => b.status === "venteliste").length ?? 0;

    const { data: tours, error: toursError } = await supabase
      .from("tours")
      .select("id")
      .eq("status", "published");

    let ledigePlasser = 0;
    const aktiveTurer = tours?.length ?? 0;

    if (!toursError && tours && tours.length > 0) {
      try {
        const tourIds = tours.map((t) => t.id);
        const remainingByTourId = await getRemainingSeatsForTours(
          supabase,
          tourIds,
        );
        for (const seats of remainingByTourId.values()) {
          ledigePlasser += seats;
        }
      } catch (err) {
        console.error("Error computing remaining seats for stats:", err);
      }
    }

    return {
      success: true,
      data: {
        totaleBestillinger,
        bekreftet,
        venteliste,
        ledigePlasser,
        aktiveTurer,
      },
    };
  } catch (err) {
    console.error("Error in getBookingStats:", err);
    return { success: true, data: EMPTY_STATS };
  }
}

/**
 * Henter de siste N bestillingene for "Siste bestillinger" i overview.
 */
export async function getRecentBookings(limit: number = 3): Promise<{
  success: true;
  data: Array<{
    id: string;
    navn: string;
    turTittel: string;
    status: Booking["status"];
  }>;
}> {
  try {
    const supabase = await createClient();

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `
      id,
      navn,
      status,
      tours (
        title
      )
    `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent bookings:", error);
      return {
        success: true,
        data: [],
      };
    }

    const recentBookings = (bookings || []).map((booking) => {
      const bookingWithTours = booking as unknown as {
        tours: Tour | Tour[] | null;
      };
      const toursData = bookingWithTours.tours;

      let tour: Tour | null = null;
      if (toursData) {
        if (Array.isArray(toursData)) {
          tour = toursData.length > 0 ? toursData[0] : null;
        } else if (!Array.isArray(toursData)) {
          tour = toursData;
        }
      }

      return {
        id: booking.id,
        navn: booking.navn,
        turTittel: tour?.title ?? "Ukjent tur",
        status: booking.status,
      };
    });

    return {
      success: true,
      data: recentBookings,
    };
  } catch (err) {
    console.error("Error in getRecentBookings:", err);
    return { success: true, data: [] };
  }
}
