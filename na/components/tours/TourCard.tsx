import Image from "next/image";
import Link from "next/link";
import type { Tour } from "@/lib/types";
import {
  formatPrice,
  getTourDays,
  getTourImageUrl,
  getTerrengLabel,
  getVanskelighetsgradLabel,
} from "@/lib/tourUtils";
import { cn } from "@/lib/utils";

type TourCardProps = {
  tour: Tour;
  className?: string;
  /** Set "home" when card is on homepage so "Tilbake" on detail page goes to /. Set "turer" when on /turer so Tilbake goes to /turer. */
  fromPage?: "home" | "turer";
};

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function TourCard({ tour, className, fromPage }: TourCardProps) {
  const detailHref =
    fromPage === "home" ? `/turer/${tour.id}?from=home` : `/turer/${tour.id}`;
  const imageUrl = getTourImageUrl(tour);
  const days = getTourDays(tour);
  const terrengLabel = getTerrengLabel(tour.terreng);
  const vanskelighetsgradLabel = getVanskelighetsgradLabel(
    tour.vanskelighetsgrad,
  );

  return (
    <article
      className={cn(
        "bg-card text-card-foreground flex flex-col overflow-hidden rounded-xl shadow-lg",
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
                tour.terreng === "asfalt" && "bg-[hsl(180,30%,25%)] text-white",
                tour.terreng === "grus" && "bg-[hsl(15,70%,45%)] text-white",
                tour.terreng === "blandet" &&
                  "bg-[hsl(220,15%,25%)] text-white",
              )}
            >
              {terrengLabel}
            </span>
          )}
          {vanskelighetsgradLabel && (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                tour.vanskelighetsgrad === "nybegynner" &&
                  "bg-[hsl(140,40%,40%)] text-white",
                tour.vanskelighetsgrad === "intermediær" &&
                  "bg-[hsl(45,70%,45%)] text-[hsl(220,20%,10%)]",
                (tour.vanskelighetsgrad === "erfaren" ||
                  tour.vanskelighetsgrad === "ekspert") &&
                  "bg-[hsl(25,70%,40%)] text-white",
              )}
            >
              {vanskelighetsgradLabel}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-foreground mb-2 text-lg font-bold">{tour.title}</h3>
        {tour.short_description && (
          <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
            {tour.short_description}
          </p>
        )}

        <div className="text-muted-foreground mb-4 grid grid-cols-2 gap-x-4 gap-y-5 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <span>{days} dager</span>
          </div>
          {tour.sted ? (
            <div className="flex items-center gap-2">
              <MapPinIcon />
              <span>{tour.sted}</span>
            </div>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <UsersIcon />
            <span>{tour.seats_available} plasser ledig</span>
          </div>
          <p className="text-primary text-lg font-bold tracking-tight">
            {formatPrice(tour.price)}
          </p>
        </div>

        <Link
          href={detailHref}
          className="border-primary text-foreground hover:bg-primary/10 mt-auto inline-flex w-fit items-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
        >
          LES MER →
        </Link>
      </div>
    </article>
  );
}
