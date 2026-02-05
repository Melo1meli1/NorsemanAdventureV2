"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Mail } from "lucide-react";
import { formatPrice } from "@/lib/tourUtils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/supabaseBrowser";
import { WaitlistForm } from "./WaitlistForm";
import Link from "next/link";

type BookSpotCardProps = {
  price: number;
  initialSeatsAvailable: number;
  totalSeats: number;
  tourId?: string;
  className?: string;
};

export function BookSpotCard({
  price,
  initialSeatsAvailable,
  totalSeats,
  tourId,
  className,
}: BookSpotCardProps) {
  const [seatsAvailable, setSeatsAvailable] = useState(initialSeatsAvailable);

  useEffect(() => {
    setSeatsAvailable(initialSeatsAvailable);
  }, [initialSeatsAvailable]);

  useEffect(() => {
    if (!tourId) return;

    const supabase = getSupabaseBrowserClient();

    async function refetchAvailability() {
      try {
        const res = await fetch(`/api/tours/${tourId}/availability`);
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.remainingSeats === "number") {
          setSeatsAvailable(data.remainingSeats);
        }
      } catch {
        // Ignorer feil –  beholder sist kjente verdi.
      }
    }

    const channel = supabase
      .channel(`tour-availability-${tourId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `tour_id=eq.${tourId}`,
        },
        (payload: { new: { status?: string } | null }) => {
          const status = (payload.new as { status?: string } | null)?.status;
          if (status === "betalt" || status === "delvis_betalt") {
            void refetchAvailability();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `tour_id=eq.${tourId}`,
        },
        (payload: {
          new: { status?: string } | null;
          old: { status?: string } | null;
        }) => {
          const newStatus = (payload.new as { status?: string } | null)?.status;
          const oldStatus = (payload.old as { status?: string } | null)?.status;
          const becameConfirmed =
            (newStatus === "betalt" || newStatus === "delvis_betalt") &&
            oldStatus !== "betalt" &&
            oldStatus !== "delvis_betalt";
          const leftConfirmed =
            (oldStatus === "betalt" || oldStatus === "delvis_betalt") &&
            newStatus !== "betalt" &&
            newStatus !== "delvis_betalt";

          if (becameConfirmed || leftConfirmed) {
            void refetchAvailability();
          }
        },
      )
      .subscribe();

    // Hent siste status ved mount slik at vi ikke er avhengig av SSR-data
    void refetchAvailability();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tourId]);

  const signedUp = Math.max(0, totalSeats - seatsAvailable);
  const isSoldOut = seatsAvailable <= 0;

  return (
    <aside
      className={cn(
        "border-border bg-card rounded-xl border p-6 shadow-lg",
        className,
      )}
      aria-labelledby="bestill-plass-heading"
    >
      <h2
        id="bestill-plass-heading"
        className="text-foreground mb-4 flex items-center justify-between text-lg font-bold"
      >
        <span>Bestill plass</span>
        <span className="text-primary">{formatPrice(price)}</span>
      </h2>

      <div className="mb-6 space-y-2">
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground font-medium">Kapasitet:</span>{" "}
          <span className="font-semibold">{totalSeats} plasser totalt</span>
        </p>
        <p className="text-sm">
          {isSoldOut ? (
            <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
              Utsolgt
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold tracking-wide text-black uppercase">
              {seatsAvailable} plass(er) igjen
            </span>
          )}
        </p>
        {signedUp > 0 && (
          <p className="text-muted-foreground text-xs">
            {signedUp}{" "}
            {signedUp === 1 ? "person er påmeldt" : "personer er påmeldt"}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {tourId && !isSoldOut && (
          <Button
            size="lg"
            className="w-full gap-2 font-semibold tracking-wide uppercase"
            aria-label="Bestill nå"
            asChild
          >
            <Link href={`/turer/${tourId}/bestill`}>
              <ShoppingCart className="size-5" aria-hidden />
              Bestill nå
            </Link>
          </Button>
        )}
        {isSoldOut && tourId && <WaitlistForm tourId={tourId} />}
        {!isSoldOut && (
          <Button
            size="lg"
            variant="outline"
            className="border-primary text-foreground hover:bg-primary/10 w-full gap-2 font-semibold tracking-wide uppercase"
            aria-label="Legg i handlekurv"
          >
            <ShoppingCart className="size-5" aria-hidden />
            Legg i handlekurv
          </Button>
        )}
      </div>

      <div className="border-border mt-6 border-t pt-6">
        <p className="text-muted-foreground mb-2 text-sm">Spørsmål om turen?</p>
        <a
          href="#kontakt"
          className="text-foreground focus-visible:ring-ring inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline"
          aria-label="Kontakt oss"
        >
          <Mail className="size-4" aria-hidden />
          Kontakt oss
        </a>
      </div>
    </aside>
  );
}
