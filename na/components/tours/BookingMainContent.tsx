"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, CreditCard, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/tourUtils";
import type { BookingCartItem } from "@/lib/types";
import type { BookingStepId } from "./BookingProgressBar";
import { cn } from "@/lib/utils";
import {
  ParticipantBookingForm,
  type ParticipantBookingFormRef,
} from "./ParticipantBookingForm";
import type { BookingFormValues } from "@/lib/zod/bookingValidation";

type BookingMainContentProps = {
  currentStep: BookingStepId;
  cartItems: BookingCartItem[];
  onQuantityChange: (id: string, quantity: number) => void;
  participantCount?: number;
  informasjonFormRef?: React.RefObject<ParticipantBookingFormRef | null>;
  onInformasjonValid?: (data: BookingFormValues) => void;
  className?: string;
};

export function BookingMainContent({
  currentStep,
  cartItems,
  onQuantityChange,
  participantCount = 0,
  informasjonFormRef,
  onInformasjonValid,
  className,
}: BookingMainContentProps) {
  if (currentStep === "handlekurv") {
    return (
      <div
        className={cn(
          "border-border bg-card flex min-h-[200px] flex-1 flex-col rounded-xl border p-6 shadow-sm",
          className,
        )}
        aria-label="Handlekurv"
      >
        <h2 className="text-foreground mb-4 text-lg font-bold">
          Turer du bestiller
        </h2>
        {cartItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Ingen turer i handlekurven.
          </p>
        ) : (
          <ul className="flex flex-col gap-4" aria-label="Varer i handlekurven">
            {cartItems.map((item) => (
              <li
                key={item.tourId}
                className="border-border flex flex-wrap items-center gap-4 rounded-lg border p-4"
              >
                <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-md sm:size-20">
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-foreground font-medium">
                    {item.title}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9"
                    onClick={() => onQuantityChange(item.tourId, -1)}
                    disabled={item.quantity <= 1}
                    aria-label={`Reduser antall ${item.title}`}
                  >
                    <Minus className="size-4" aria-hidden />
                  </Button>
                  <span
                    className="text-foreground w-8 text-center tabular-nums"
                    aria-live="polite"
                  >
                    {item.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9"
                    onClick={() => onQuantityChange(item.tourId, 1)}
                    aria-label={`Øk antall ${item.title}`}
                  >
                    <Plus className="size-4" aria-hidden />
                  </Button>
                </div>
                <span className="text-foreground shrink-0 font-semibold tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (currentStep === "informasjon") {
    const count = Math.max(1, participantCount);
    return (
      <div
        className={cn(
          "border-border bg-card flex min-h-[200px] flex-1 flex-col rounded-xl border p-6 shadow-sm",
          className,
        )}
      >
        <ParticipantBookingForm
          key={count}
          ref={informasjonFormRef ?? undefined}
          participantCount={count}
          onValid={onInformasjonValid}
          className="min-w-0"
        />
      </div>
    );
  }

  if (currentStep === "betaling") {
    return (
      <div
        className={cn(
          "border-border bg-card flex min-h-[200px] flex-1 flex-col rounded-xl border p-6 shadow-sm",
          className,
        )}
        aria-label="Betaling"
      >
        <h2 className="text-foreground mb-1 flex items-center gap-2 text-lg font-bold">
          <CreditCard className="size-5 shrink-0" aria-hidden />
          Betaling
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Du betaler sikkert med LetsReg. Betalingsløsningen kobles inn her.
        </p>
        {/* Mock: plassholder der LetsReg-widget kommer */}
        <div className="border-border bg-muted/30 flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <CreditCard
            className="text-muted-foreground mb-3 size-10"
            aria-hidden
          />
          <p className="text-muted-foreground mb-4 text-center text-sm">
            LetsReg betalingsmodul kommer her
          </p>
          <Button disabled size="lg" className="pointer-events-none">
            Betal med LetsReg
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === "bekreftelse") {
    return (
      <div
        className={cn(
          "border-border bg-card flex min-h-[200px] flex-1 flex-col items-center rounded-xl border p-8 shadow-sm sm:p-10",
          className,
        )}
        aria-label="Bestilling fullført"
      >
        <div
          className="mb-6 flex size-16 shrink-0 items-center justify-center rounded-full bg-green-700 sm:size-20"
          aria-hidden
        >
          <Check className="size-8 text-white sm:size-10" strokeWidth={3} />
        </div>
        <h2 className="text-foreground mb-2 text-center text-xl font-bold sm:text-2xl">
          Takk for din bestilling!
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm text-center text-sm sm:mb-10">
          En bekreftelse har blitt sendt til din e-post.
        </p>
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <Link href="/public/tours">Se flere turer</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-border bg-card flex min-h-[200px] flex-1 flex-col items-center justify-center rounded-xl border p-6 shadow-sm",
        className,
      )}
      aria-label="Bestillingssteg"
    >
      <p className="text-muted-foreground text-center text-sm">
        Bestillingsskjema kommer
      </p>
    </div>
  );
}
