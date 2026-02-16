"use client";

import Link from "next/link";
import { useState, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BookingCartItem } from "@/lib/types";
import { BookingMainContent } from "./BookingMainContent";
import { BookingProgressBar, type BookingStepId } from "./BookingProgressBar";
import { type ParticipantBookingFormRef } from "./ParticipantBookingForm";
import { OrderSummary } from "./OrderSummary";
import type { BookingFormValues } from "@/lib/zod/bookingValidation";
import { cn } from "@/lib/utils";
import { createBookingFromPublic } from "@/app/public/tours/[id]/bestill/actions";
import { useToast } from "@/hooks/use-toast";

const STEP_ORDER: BookingStepId[] = [
  "handlekurv",
  "informasjon",
  "betaling",
  "bekreftelse",
];

type BookingStepNavigatorProps = {
  tourId: string;
  initialCartItems: BookingCartItem[];
  maxAvailableSeats?: number;
  isExpertTour?: boolean;
  progressBarClassName?: string;
  className?: string;
};

export function BookingStepNavigator({
  tourId,
  initialCartItems,
  maxAvailableSeats,
  isExpertTour,
  progressBarClassName,
  className,
}: BookingStepNavigatorProps) {
  const [currentStep, setCurrentStep] = useState<BookingStepId>("handlekurv");
  const [cartItems, setCartItems] =
    useState<BookingCartItem[]>(initialCartItems);
  const [isSubmittingInformasjon, setIsSubmittingInformasjon] = useState(false);
  const informasjonFormRef = useRef<ParticipantBookingFormRef | null>(null);
  const { toast } = useToast();
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEP_ORDER.length - 1;

  const participantCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const belop = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const goBack = () => {
    if (isFirstStep) return;
    setCurrentStep(STEP_ORDER[currentIndex - 1]);
  };

  const goNext = () => {
    if (isLastStep) return;
    if (currentStep === "informasjon") {
      informasjonFormRef.current?.triggerSubmit();
      return;
    }
    setCurrentStep(STEP_ORDER[currentIndex + 1]);
  };

  const onInformasjonValid = useCallback(
    async (data: BookingFormValues) => {
      setIsSubmittingInformasjon(true);
      try {
        const result = await createBookingFromPublic({
          tourId,
          participants: data.participants,
          belop,
          readExpertInfo: data.readExpertInfo,
        });
        if (!result.success) {
          toast({
            variant: "destructive",
            title: "Kunne ikke lagre bestilling",
            description: result.error,
          });
        } else {
          // Når informasjonen er gyldig og lagret, gå videre til betalingssteget
          setCurrentStep("betaling");
        }
      } finally {
        setIsSubmittingInformasjon(false);
      }
    },
    [tourId, belop, toast],
  );

  const onQuantityChange = useCallback(
    (tourId: string, delta: number) => {
      setCartItems((prev) => {
        if (delta > 0 && maxAvailableSeats != null) {
          const currentTotal = prev.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );

          if (currentTotal >= maxAvailableSeats) {
            toast({
              variant: "destructive",
              title: "Ikke nok ledige plasser",
              description: `Det er bare ${maxAvailableSeats} plasser igjen på turen.`,
            });
            return prev;
          }
        }

        return prev
          .map((item) =>
            item.tourId === tourId
              ? { ...item, quantity: Math.max(1, item.quantity + delta) }
              : item,
          )
          .filter((item) => item.quantity > 0);
      });
    },
    [maxAvailableSeats, toast],
  );

  const orderSummaryItems = cartItems.map((item) => ({
    title: item.title,
    price: item.price,
    quantity: item.quantity,
  }));

  return (
    <div className={cn("flex w-full flex-col gap-8", className)}>
      {/* Progress bar: egen smal seksjon, uavhengig av innholdet under */}
      <div className="flex w-full justify-center">
        <BookingProgressBar
          currentStep={currentStep}
          className={progressBarClassName}
          onStepClick={(stepId) => {
            const targetIndex = STEP_ORDER.indexOf(stepId);
            if (targetIndex === -1 || stepId === currentStep) return;

            // Tillat alltid å gå tilbake til tidligere steg
            if (targetIndex < currentIndex) {
              setCurrentStep(stepId);
              return;
            }

            // Fra handlekurv: hopp først til informasjon
            if (currentStep === "handlekurv") {
              setCurrentStep("informasjon");
              return;
            }

            // Fra informasjon til senere steg: trigge validering/lagring først
            if (currentStep === "informasjon") {
              informasjonFormRef.current?.triggerSubmit();
              return;
            }

            // Ellers: gå direkte til ønsket steg
            setCurrentStep(stepId);
          }}
        />
      </div>
      {/* Informasjonskomponent + ordresammendrag: bredere enn progress bar */}
      <div className="grid w-full max-w-7xl grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-4">
          <BookingMainContent
            currentStep={currentStep}
            cartItems={cartItems}
            onQuantityChange={onQuantityChange}
            participantCount={participantCount}
            informasjonFormRef={informasjonFormRef}
            onInformasjonValid={onInformasjonValid}
            isExpertTour={isExpertTour}
            className="min-w-0"
          />
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {isFirstStep ? (
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary text-base sm:text-lg"
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
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary text-base sm:text-lg"
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
              className="text-base font-semibold sm:text-lg"
              onClick={goNext}
              disabled={isLastStep || isSubmittingInformasjon}
              aria-label={
                currentStep === "betaling"
                  ? "Betal"
                  : isLastStep
                    ? "Siste steg"
                    : "Neste steg"
              }
            >
              {currentStep === "betaling" ? "Betal" : "Neste"}
              <ArrowRight className="size-5" aria-hidden />
            </Button>
          </div>
        </div>
        <aside className="w-full lg:w-auto lg:min-w-[280px]">
          <OrderSummary items={orderSummaryItems} />
        </aside>
      </div>
    </div>
  );
}
