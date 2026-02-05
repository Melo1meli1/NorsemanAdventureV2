"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CreditCard, ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MockPaymentProvider() {
  const searchParams = useSearchParams();
  const refId = searchParams.get("ref"); // Booking ID vi sendte med
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");

  const handlePayment = async () => {
    setStatus("processing");

    const res = await fetch("/api/webhooks/letsreg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference_id: refId,
        status: "COMPLETED",
        transaction_id: "mock_trans_123",
      }),
    });

    if (res.ok) {
      window.location.href = `/admin/dashboard/orders/success?bookingId=${refId}`;
    } else {
      setStatus("error");
    }
  };

  const isDisabled = !refId || status === "processing";

  return (
    <section aria-label="Betaling" className="flex w-full justify-center">
      <div
        className={cn(
          "border-border bg-card w-full max-w-xl rounded-xl border p-6 shadow-sm sm:p-8",
        )}
      >
        <header className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
              <CreditCard className="size-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-foreground text-lg font-semibold">
                Betaling med LetsReg (simulert)
              </h1>
              <p className="text-muted-foreground text-xs">
                Dette er en trygg testsimulator for betaling.
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-1 text-xs font-medium text-emerald-500 sm:flex">
            <ShieldCheck className="size-4" aria-hidden />
            Sikker betaling
          </div>
        </header>

        <div className="border-border bg-background/40 mb-6 rounded-lg border p-4 text-sm">
          <div className="mb-2 flex items-center gap-2">
            <Info className="text-primary size-4" aria-hidden />
            <span className="text-foreground font-medium">Testsituasjon</span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Denne siden brukes kun til brukertesting. Når du trykker på
            &quot;Fullfør betaling (simulert)&quot;, later vi som om du
            gjennomfører en ekte betaling, og bestillingen markeres som betalt i
            systemet.
          </p>
        </div>

        <dl className="mb-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="bg-muted/40 rounded-lg p-3">
            <dt className="text-muted-foreground text-xs tracking-wide uppercase">
              Booking-ID
            </dt>
            <dd className="text-foreground mt-1 font-mono text-xs sm:text-sm">
              {refId ?? "Ukjent"}
            </dd>
          </div>
          <div className="bg-muted/40 rounded-lg p-3">
            <dt className="text-muted-foreground text-xs tracking-wide uppercase">
              Beløp
            </dt>
            <dd className="text-foreground mt-1 font-semibold">NOK 5 000,-</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={handlePayment}
            disabled={isDisabled}
            aria-disabled={isDisabled}
          >
            {status === "processing"
              ? "Behandler betaling..."
              : "Fullfør betaling (simulert)"}
          </Button>

          <p className="text-muted-foreground text-xs sm:text-right">
            Du blir sendt videre til en bekreftelsesside etter at betalingen er
            registrert.
          </p>
        </div>

        <div className="text-muted-foreground mt-4 text-xs">
          {status === "idle" && "Ingen betaling er gjennomført ennå."}
          {status === "processing" &&
            "Vent et øyeblikk mens vi fullfører betalingen..."}
          {status === "error" &&
            "Kunne ikke simulere betalingen. Prøv igjen eller kontakt administrator."}
        </div>
      </div>
    </section>
  );
}
