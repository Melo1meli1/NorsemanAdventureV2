import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import type { Tour } from "@/lib/types";
import {
  formatPrice,
  getTourDays,
  getTourImageUrl,
  getTerrengLabel,
} from "@/lib/tourUtils";
import { DifficultyBadge } from "./DifficultyBadge";
import { cn } from "@/lib/utils";

type TourCardProps = {
  tour: Tour;
  className?: string;
  fromPage?: "home" | "turer";
};

export function TourCard({ tour, className, fromPage }: TourCardProps) {
  const detailHref =
    fromPage === "home"
      ? `/public/tours/${tour.id}?from=home`
      : `/public/tours/${tour.id}`;
  const imageUrl = getTourImageUrl(tour);
  const days = getTourDays(tour);
  const terrengLabel = getTerrengLabel(tour.terreng);

  return (
    <Link
      href={detailHref}
      aria-label={`Les mer om ${tour.title}`}
      className="focus-visible:ring-primary focus-visible:ring-offset-background block rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <article
        className={cn(
          "bg-card text-card-foreground mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-xl shadow-lg transition-shadow hover:shadow-xl sm:max-w-md md:h-96 md:max-w-none lg:h-134",
          className,
        )}
      >
        <div className="relative aspect-16/10 w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {terrengLabel && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  tour.terreng === "asfalt" &&
                    "bg-[hsl(180,30%,25%)] text-white",
                  tour.terreng === "grus" && "bg-[hsl(15,70%,45%)] text-white",
                  tour.terreng === "blandet" &&
                    "bg-[hsl(220,15%,25%)] text-white",
                )}
              >
                {terrengLabel}
              </span>
            )}
            <DifficultyBadge vanskelighetsgrad={tour.vanskelighetsgrad} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-foreground mb-2 text-lg font-bold">
            {tour.title}
          </h3>
          {tour.short_description && (
            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm sm:line-clamp-3">
              {tour.short_description}
            </p>
          )}

          <div className="text-muted-foreground mb-4 grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{days} dager</span>
            </div>
            {tour.sted ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{tour.sted}</span>
              </div>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0" />
              <span>
                {tour.seats_available} av{" "}
                {(tour as { total_seats?: number }).total_seats ??
                  tour.seats_available}{" "}
                plasser
              </span>
            </div>
            <p className="text-primary text-lg font-bold tracking-tight">
              {formatPrice(tour.price)}
            </p>
          </div>

          <div className="border-primary text-foreground hover:bg-primary/10 mt-auto inline-flex w-fit items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors">
            LES MER →
          </div>
        </div>
      </article>
    </Link>
  );
}
