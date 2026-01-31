"use client";

import { formatPrice } from "@/lib/tourUtils";
import { cn } from "@/lib/utils";

/** Én linje i handlekurven – klar for flere turer senere */
export type OrderSummaryItem = {
  title: string;
  price: number;
  quantity: number;
};

type OrderSummaryProps = {
  items: OrderSummaryItem[];
  className?: string;
};

export function OrderSummary({ items, className }: OrderSummaryProps) {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <aside
      className={cn(
        "border-border bg-card flex w-full max-w-sm flex-col rounded-xl border p-6 shadow-sm",
        className,
      )}
      aria-labelledby="ordresammendrag-heading"
    >
      <h2
        id="ordresammendrag-heading"
        className="text-foreground mb-4 text-lg font-bold"
      >
        Ordresammendrag
      </h2>

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Ingen turer i handlekurven.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-2" aria-label="Varer i handlekurven">
            {items.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="text-muted-foreground flex items-baseline justify-between gap-4 text-sm"
              >
                <span>
                  {item.quantity}x {item.title}
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div
            className="border-border mt-4 border-t pt-4"
            aria-label="Totalsum"
          >
            <div className="text-foreground flex items-baseline justify-between gap-4 font-bold">
              <span>Totalsum</span>
              <span className="text-primary tabular-nums">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
