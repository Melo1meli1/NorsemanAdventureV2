import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Check,
  MapPin,
  Sun,
  Snowflake,
  Users,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/supabase-server";
import { Button } from "@/components/ui/button";
import { BookSpotCard } from "@/components/tours/BookSpotCard";
import {
  formatStartDate,
  getTourDays,
  getTourImageUrl,
  getTerrengLabel,
  getVanskelighetsgradLabel,
  getSesongLabel,
  parseHoydepunkter,
} from "@/lib/tourUtils";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
};

export default async function TourDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { from } = await searchParams;
  const backHref = from === "home" ? "/" : "/turer";
  const backLabel =
    from === "home"
      ? "Tilbake til forsiden"
      : "Tilbake til oversikt over turer";
  const supabase = await createClient();
  const { data: tour, error } = await supabase
    .from("tours")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !tour) notFound();

  const imageUrl = getTourImageUrl(tour);
  const days = getTourDays(tour);
  const terrengLabel = getTerrengLabel(tour.terreng);
  const vanskelighetsgradLabel = getVanskelighetsgradLabel(
    tour.vanskelighetsgrad,
  );
  const sesongLabel = getSesongLabel(tour.sesong);
  const hoydepunkterList = parseHoydepunkter(tour.hoydepunkter);

  return (
    <main className="bg-background min-h-screen">
      {/* Hero: full-width image + gradient + back + tags + title */}
      <header className="relative w-full">
        <div className="relative aspect-21/9 w-full overflow-hidden sm:aspect-3/1">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div
            className="to-background absolute inset-0 bg-linear-to-b from-transparent via-transparent"
            aria-hidden
          />
        </div>
        <div className="absolute top-0 left-0 p-4 sm:p-6 md:p-8">
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="border-primary text-foreground hover:border-primary hover:bg-primary/20 rounded-lg border-2 bg-black/50 backdrop-blur-sm"
            aria-label={backLabel}
          >
            <Link href={backHref}>← Tilbake</Link>
          </Button>
        </div>
        <div className="absolute right-0 bottom-0 left-0 flex flex-col gap-4 p-4 sm:p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            {sesongLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                {tour.sesong === "sommer" ? (
                  <Sun className="size-4" aria-hidden />
                ) : (
                  <Snowflake className="size-4" aria-hidden />
                )}
                {sesongLabel}
              </span>
            )}
            {terrengLabel && (
              <span className="rounded-full border border-white/30 bg-black/40 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                {terrengLabel}
              </span>
            )}
            {vanskelighetsgradLabel && (
              <span className="rounded-full border border-white/30 bg-black/40 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                {vanskelighetsgradLabel}
              </span>
            )}
          </div>
          <h1 className="text-primary max-w-4xl text-3xl font-bold tracking-tight drop-shadow-sm sm:text-4xl md:text-5xl">
            {tour.title}
          </h1>
        </div>
      </header>

      {/* Content: two columns — wider on large screens, less side space */}
      <div className="mx-auto max-w-6xl px-8 py-8 sm:px-10 md:px-14 md:py-12 lg:max-w-7xl lg:px-16 xl:max-w-[1400px] xl:px-20 xl:py-16 2xl:max-w-[1600px] 2xl:px-24">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 lg:gap-12 xl:gap-16">
          {/* Left: Om turen + Høydepunkter + icon blocks */}
          <article className="space-y-8 lg:col-span-2 lg:space-y-10 xl:space-y-12">
            <section aria-labelledby="om-turen-heading">
              <h2
                id="om-turen-heading"
                className="text-foreground mb-3 text-xl font-bold"
              >
                Om turen
              </h2>
              {tour.short_description ? (
                <p className="text-muted-foreground leading-relaxed">
                  {tour.short_description}
                </p>
              ) : null}
              {tour.long_description ? (
                <p className="text-muted-foreground mt-4 leading-relaxed whitespace-pre-wrap">
                  {tour.long_description}
                </p>
              ) : null}
            </section>

            {hoydepunkterList.length > 0 ? (
              <section
                className="border-border bg-card rounded-xl border p-6"
                aria-labelledby="hoydepunkter-heading"
              >
                <h2
                  id="hoydepunkter-heading"
                  className="text-foreground mb-4 text-xl font-bold"
                >
                  Høydepunkter
                </h2>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {hoydepunkterList.map((punkt) => (
                    <li
                      key={punkt}
                      className="text-muted-foreground flex items-center gap-2"
                    >
                      <Check
                        className="text-primary size-5 shrink-0"
                        aria-hidden
                      />
                      <span>{punkt}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section
              className="grid grid-cols-2 gap-4 sm:grid-cols-4"
              aria-label="Turinformasjon"
            >
              <InfoBlock
                icon={<Calendar className="text-primary size-5" aria-hidden />}
                label="Varighet"
                value={`${days} dager`}
              />
              <InfoBlock
                icon={<MapPin className="text-primary size-5" aria-hidden />}
                label="Destinasjon"
                value={tour.sted ?? "Ikke angitt"}
              />
              <InfoBlock
                icon={<Users className="text-primary size-5" aria-hidden />}
                label="Gruppestørrelse"
                value={`Maks ${tour.total_seats ?? tour.seats_available}`}
              />
              <InfoBlock
                icon={<Clock className="text-primary size-5" aria-hidden />}
                label="Startdato"
                value={formatStartDate(tour.start_date)}
              />
            </section>
          </article>

          {/* Right: Bestill plass */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <BookSpotCard
                price={tour.price}
                seatsAvailable={tour.seats_available}
                totalSeats={tour.total_seats ?? tour.seats_available}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "border-primary bg-card flex flex-col gap-2 rounded-lg border-2 p-4",
      )}
    >
      <span aria-hidden>{icon}</span>
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-foreground font-semibold">{value}</span>
    </div>
  );
}
