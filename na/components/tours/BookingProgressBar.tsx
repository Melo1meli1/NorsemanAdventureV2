"use client";

import {
  ShoppingCart,
  UserCircle,
  CreditCard,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type BookingStepId =
  | "handlekurv"
  | "informasjon"
  | "betaling"
  | "bekreftelse";

const STEPS: {
  id: BookingStepId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}[] = [
  {
    id: "handlekurv",
    label: "Handlekurv",
    shortLabel: "Kurv",
    icon: ShoppingCart,
  },
  {
    id: "informasjon",
    label: "Informasjon",
    shortLabel: "Info",
    icon: UserCircle,
  },
  {
    id: "betaling",
    label: "Betaling",
    shortLabel: "Betaling",
    icon: CreditCard,
  },
  {
    id: "bekreftelse",
    label: "Bekreftelse",
    shortLabel: "Ferdig",
    icon: CheckCircle,
  },
];

export function BookingProgressBar({
  currentStep = "handlekurv",
  className,
  onStepClick,
}: {
  currentStep?: BookingStepId;
  className?: string;
  onStepClick?: (stepId: BookingStepId) => void;
}) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav
      aria-label="Bestillingssteg"
      className={cn("flex items-center justify-center gap-0", className)}
    >
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === STEPS.length - 1;
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        const isClickable = typeof onStepClick === "function";

        return (
          <div key={step.id} className="flex items-center">
            {/* Boble: mobil = kompakt (ikon + kort label), sm+ = full label – fullskjerm uendret */}
            <button
              type="button"
              className={cn(
                "flex items-center gap-1.5 rounded-full border-2 px-2 py-1.5 text-xs font-medium sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-base",
                isCurrent &&
                  "border-primary bg-primary text-primary-foreground",
                isCompleted && "border-primary bg-primary/25 text-primary",
                !isCurrent &&
                  !isCompleted &&
                  "border-muted-foreground/30 bg-muted text-muted-foreground",
                isClickable &&
                  "focus-visible:ring-primary focus-visible:ring-offset-background cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={step.label}
              onClick={() => {
                if (!isClickable) return;
                onStepClick?.(step.id);
              }}
            >
              <Icon className="size-4 shrink-0 sm:size-5" aria-hidden />
              <span className="sm:inline">
                <span className="sm:hidden">{step.shortLabel}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </span>
            </button>
            {/* Linje til neste */}
            {!isLast && (
              <div
                className={cn(
                  "mx-1.5 h-0.5 w-4 shrink-0 sm:mx-3 sm:w-10",
                  index < currentIndex ? "bg-primary" : "bg-muted",
                )}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
