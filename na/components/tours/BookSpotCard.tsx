"use client";

import { ShoppingCart, Mail } from "lucide-react";
import { formatPrice } from "@/lib/tourUtils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookSpotCardProps = {
  price: number;
  seatsAvailable: number;
  className?: string;
};

export function BookSpotCard({
  price,
  seatsAvailable,
  className,
}: BookSpotCardProps) {
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

      <p className="text-muted-foreground mb-6 text-sm">
        <span className="text-foreground font-medium">Ledige plasser:</span>{" "}
        {seatsAvailable} plasser
      </p>

      <div className="flex flex-col gap-3">
        <Button
          size="lg"
          className="w-full gap-2 font-semibold tracking-wide uppercase"
          aria-label="Bestill nå"
        >
          <ShoppingCart className="size-5" aria-hidden />
          Bestill nå
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-primary text-foreground hover:bg-primary/10 w-full gap-2 font-semibold tracking-wide uppercase"
          aria-label="Legg i handlekurv"
        >
          <ShoppingCart className="size-5" aria-hidden />
          Legg i handlekurv
        </Button>
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
