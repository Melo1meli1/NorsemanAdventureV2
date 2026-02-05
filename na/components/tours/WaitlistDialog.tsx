"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WaitlistForm } from "./WaitlistForm";

type WaitlistDialogProps = {
  tourId: string;
  className?: string;
};

export function WaitlistDialog({ tourId, className }: WaitlistDialogProps) {
  const [open, setOpen] = useState(false);
  const [lastWaitlistedEmail, setLastWaitlistedEmail] = useState<string | null>(
    null,
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="border-primary text-primary hover:bg-primary/10 w-full gap-2 font-semibold tracking-wide uppercase"
        onClick={() => setOpen(true)}
      >
        Sett meg på venteliste
      </Button>

      {lastWaitlistedEmail && (
        <p className="text-muted-foreground text-xs">
          Venteliste registrert for{" "}
          <span className="font-semibold">{lastWaitlistedEmail}</span>. Du kan
          registrere flere personer ved å trykke knappen igjen.
        </p>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="border-border bg-background relative w-full max-w-sm rounded-xl border p-4 shadow-lg sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-foreground text-sm font-semibold sm:text-base">
                Sett meg på venteliste
              </h2>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
                aria-label="Lukk ventelistevindu"
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>
            <WaitlistForm
              tourId={tourId}
              onSuccess={({ email }) => {
                setLastWaitlistedEmail(email);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
