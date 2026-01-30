"use client";

import {
  ShoppingCart,
  UserCircle,
  CreditCard,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "handlekurv", label: "Handlekurv", icon: ShoppingCart },
  { id: "informasjon", label: "Informasjon", icon: UserCircle },
  { id: "betaling", label: "Betaling", icon: CreditCard },
  { id: "bekreftelse", label: "Bekreftelse", icon: CheckCircle },
];

export function BookingProgressBar({
  currentStep = "handlekurv",
  className,
}: {
  currentStep?: "handlekurv" | "informasjon" | "betaling" | "bekreftelse";
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
        const isActive = index <= currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            {/* Boble: ikon + tittel inni samme oval */}
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border-2 px-4 py-2 sm:gap-2.5 sm:px-5 sm:py-2.5",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 bg-muted text-muted-foreground",
              )}
              aria-current={index === currentIndex ? "step" : undefined}
            >
              <Icon className="size-5 shrink-0 sm:size-5" aria-hidden />
              <span className="text-sm font-medium sm:text-base">
                {step.label}
              </span>
            </div>
            {/* Linje til neste (unntatt etter siste) */}
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 w-4 shrink-0 sm:w-8",
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
