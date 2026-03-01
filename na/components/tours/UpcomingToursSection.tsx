/* original kode
import Link from "next/link";
import type { Tour } from "@/lib/types";
import { TourCard } from "./TourCard";
import { Button } from "@/components/ui/button";

type UpcomingToursSectionProps = {
  tours: Tour[];
};

export function UpcomingToursSection({ tours }: UpcomingToursSectionProps) {
  return (
    <section className="bg-card/60 w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mb-12 text-center">
          <h2 className="text-primary mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            KOMMENDE TURER
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Bli med på våre neste eventyr. Begrenset antall plasser – sikre din
            plass i dag.
          </p>
        </header>

        {tours.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  fromPage="home"
                  className="bg-background/80"
                />
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium/80 rounded-lg px-8 py-3 text-base"
              >
                <Link href="/public/tours">SE ALLE TURER →</Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center">
            Ingen turer er publisert ennå. Kom tilbake senere.
          </p>
        )}
      </div>
    </section>
  );
}
*/
import Link from "next/link";
import type { Tour } from "@/lib/types";
import { TourCard } from "./TourCard";
import { Button } from "@/components/ui/button";

type UpcomingToursSectionProps = {
  tours: Tour[];
};

function toDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isFinished(tour: Tour) {
  const end = toDate(tour.end_date);
  if (!end) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  return endDay < today;
}

export function UpcomingToursSection({ tours }: UpcomingToursSectionProps) {
  const upcomingTours = tours
    .filter((t) => !isFinished(t))
    .slice()
    .sort((a, b) => {
      const aStart =
        toDate(a.start_date)?.getTime() ?? Number.POSITIVE_INFINITY;
      const bStart =
        toDate(b.start_date)?.getTime() ?? Number.POSITIVE_INFINITY;
      return aStart - bStart;
    });

  return (
    <section className="bg-card/60 w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <header className="mb-12 text-center">
          <h2 className="text-primary mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            KOMMENDE TURER
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Bli med på våre neste eventyr. Begrenset antall plasser – sikre din
            plass i dag.
          </p>
        </header>

        {upcomingTours.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {upcomingTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  fromPage="home"
                  className="bg-background/80"
                />
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium/80 rounded-lg px-8 py-3 text-base"
              >
                <Link href="/public/tours">SE ALLE TURER →</Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-center">
            Ingen turer er publisert ennå. Kom tilbake senere.
          </p>
        )}
      </div>
    </section>
  );
}
