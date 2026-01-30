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

const STEPS: { id: BookingStepId; label: string; icon: LucideIcon }[] = [
  { id: "handlekurv", label: "Handlekurv", icon: ShoppingCart },
  { id: "informasjon", label: "Informasjon", icon: UserCircle },
  { id: "betaling", label: "Betaling", icon: CreditCard },
  { id: "bekreftelse", label: "Bekreftelse", icon: CheckCircle },
];

export function BookingProgressBar({
  currentStep = "handlekurv",
  className,
}: {
  currentStep?: BookingStepId;
  className?: string;
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

        return (
          <div key={step.id} className="flex items-center">
            {/* Boble: fullført = transparent oransj + oransj tekst; nåværende = helt oransj + hvit tekst */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border-2 px-2 py-1 sm:gap-2.5 sm:px-5 sm:py-2.5",
                isCurrent &&
                  "border-primary bg-primary text-primary-foreground",
                isCompleted && "border-primary bg-primary/25 text-primary",
                !isCurrent &&
                  !isCompleted &&
                  "border-muted-foreground/30 bg-muted text-muted-foreground",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              <Icon className="size-5 shrink-0 sm:size-5" aria-hidden />
              <span className="text-sm font-medium sm:text-base">
                {step.label}
              </span>
            </div>
            {/* Linje til neste: samme farge som boblene, gap så den ikke treffer kantene */}
            {!isLast && (
              <div
                className={cn(
                  "mx-2 h-0.5 w-6 shrink-0 sm:mx-3 sm:w-10",
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
