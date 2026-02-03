"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type OrdersFilterValue = "all" | "tours";

type OrdersFilterTabsProps = {
  value: OrdersFilterValue;
  onChange?: (value: OrdersFilterValue) => void;
};

export function OrdersFilterTabs({ value, onChange }: OrdersFilterTabsProps) {
  const isAllActive = value === "all";
  const isToursActive = value === "tours";

  return (
    <div className="mb-3 flex gap-3">
      <Button
        type="button"
        size="sm"
        onClick={() => onChange?.("all")}
        className={cn(
          "rounded-xl px-6 py-4 text-base font-semibold tracking-[0.16em]",
          isAllActive
            ? "bg-primary text-primary-foreground border-primary border"
            : "text-primary border-primary hover:bg-primary/10 border bg-transparent",
        )}
      >
        ALLE
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onChange?.("tours")}
        className={cn(
          "rounded-xl px-6 py-4 text-base font-semibold tracking-[0.16em]",
          isToursActive
            ? "bg-primary text-primary-foreground border-primary border"
            : "text-primary border-primary hover:bg-primary/10 border bg-transparent",
        )}
      >
        TURER
      </Button>
    </div>
  );
}
