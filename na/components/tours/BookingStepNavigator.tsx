"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingProgressBar, type BookingStepId } from "./BookingProgressBar";
import { cn } from "@/lib/utils";

const STEP_ORDER: BookingStepId[] = [
  "handlekurv",
  "informasjon",
  "betaling",
  "bekreftelse",
];

type BookingStepNavigatorProps = {
  tourId: string;
  progressBarClassName?: string;
  className?: string;
  /** Innhold til høyre under progress bar (f.eks. Ordresammendrag) */
  aside?: React.ReactNode;
};

export function BookingStepNavigator({
  tourId,
  progressBarClassName,
  className,
  aside,
}: BookingStepNavigatorProps) {
  const [currentStep, setCurrentStep] = useState<BookingStepId>("handlekurv");
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEP_ORDER.length - 1;

  const goBack = () => {
    if (isFirstStep) return;
    setCurrentStep(STEP_ORDER[currentIndex - 1]);
  };

  const goNext = () => {
    if (isLastStep) return;
    setCurrentStep(STEP_ORDER[currentIndex + 1]);
  };

  return (
    <div className={cn("flex w-full max-w-4xl flex-col gap-8", className)}>
      <div className="flex justify-center">
        <BookingProgressBar
          currentStep={currentStep}
          className={progressBarClassName}
        />
      </div>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {isFirstStep ? (
            <Button
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
              asChild
              aria-label="Tilbake til turen"
            >
              <Link href={`/turer/${tourId}`}>
                <ArrowLeft className="size-5" aria-hidden />
                Tilbake
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
              onClick={goBack}
              aria-label="Forrige steg"
            >
              <ArrowLeft className="size-5" aria-hidden />
              Tilbake
            </Button>
          )}
          <Button
            type="button"
            size="lg"
            onClick={goNext}
            disabled={isLastStep}
            aria-label={isLastStep ? "Siste steg" : "Neste steg"}
          >
            Neste
            <ArrowRight className="size-5" aria-hidden />
          </Button>
        </div>
        {aside != null ? (
          <aside className="w-full lg:w-auto">{aside}</aside>
        ) : null}
      </div>
    </div>
  );
}
