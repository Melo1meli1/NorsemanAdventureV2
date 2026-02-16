"use client";

import type { Tour } from "@/lib/types";
import { getVanskelighetsgradLabel } from "@/lib/tourUtils";
import { cn } from "@/lib/utils";

type DifficultyBadgeProps = {
  vanskelighetsgrad: Tour["vanskelighetsgrad"];
  className?: string;
};

export function DifficultyBadge({
  vanskelighetsgrad,
  className,
}: DifficultyBadgeProps) {
  const label = getVanskelighetsgradLabel(vanskelighetsgrad);
  if (!label) return null;

  const colorClasses =
    vanskelighetsgrad === "nybegynner"
      ? "bg-[hsl(140,40%,40%)] text-white"
      : vanskelighetsgrad === "intermediær"
        ? "bg-[hsl(45,70%,45%)] text-[hsl(220,20%,10%)]"
        : vanskelighetsgrad === "erfaren"
          ? "bg-[hsl(25,70%,40%)] text-white"
          : vanskelighetsgrad === "ekspert" && "bg-[hsl(0,65%,30%)] text-white";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClasses,
        className,
      )}
      aria-label={`Vanskelighetsgrad: ${label}`}
    >
      {label}
    </span>
  );
}
