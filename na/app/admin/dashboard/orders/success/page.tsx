import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingProgressBar } from "@/components/tours/BookingProgressBar";

type SuccessPageProps = {
  searchParams?: Promise<{ bookingId?: string }>;
};

export default async function BookingSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const resolved = await searchParams;
  const bookingId = resolved?.bookingId;

  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 sm:pt-28">
        <div className="mb-8 flex w-full justify-center">
          <BookingProgressBar
            currentStep="bekreftelse"
            className="w-full max-w-md"
          />
        </div>
        <div className="flex w-full justify-center">
          <div
            className="border-border bg-card flex min-h-[200px] w-full max-w-xl flex-col items-center rounded-xl border p-8 shadow-sm sm:p-10"
            aria-label="Bestilling fullført"
          >
            <div
              className="mb-6 flex size-16 shrink-0 items-center justify-center rounded-full bg-green-700 sm:size-20"
              aria-hidden
            >
              <Check className="size-8 text-white sm:size-10" strokeWidth={3} />
            </div>
            <h1 className="text-foreground mb-2 text-center text-xl font-bold sm:text-2xl">
              Takk for din bestilling!
            </h1>
            <p className="text-muted-foreground mb-4 max-w-sm text-center text-sm sm:mb-6">
              Betalingen er registrert.
            </p>
            {bookingId && (
              <p className="text-muted-foreground mb-6 text-xs sm:text-sm">
                Booking-ID: <span className="font-mono">{bookingId}</span>
              </p>
            )}
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/turer">Se flere turer</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
