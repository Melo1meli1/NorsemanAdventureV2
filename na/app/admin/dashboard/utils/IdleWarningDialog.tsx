"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { logoutAction } from "../actions/dashboard";

const COUNTDOWN_SECONDS = 120;
type IdleWarningDialogProps = {
  open: boolean;
  onStillWorking: () => void;
};

function CountdownDialog({ onStillWorking }: { onStillWorking: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          formRef.current?.requestSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const countdownLabel = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-dialog-title"
      aria-describedby="idle-dialog-desc"
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="bg-card mx-4 w-full max-w-sm rounded-2xl border border-neutral-700 p-8 shadow-2xl">
        {/* Timer icon with countdown */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <Timer className="text-primary h-12 w-12" />
          <div className="font-mono text-2xl font-bold text-white">
            {countdownLabel}
          </div>
        </div>

        <h2
          id="idle-dialog-title"
          className="mb-2 text-center text-lg font-bold text-white"
        >
          Er du fortsatt her?
        </h2>
        <p
          id="idle-dialog-desc"
          className="text-muted-foreground mb-8 text-center text-sm leading-relaxed"
        >
          Du har ikke hatt noen aktivitet på 30 minutter. Du blir automatisk
          logget ut om{" "}
          <span className="text-primary font-semibold">{countdownLabel}</span>.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onStillWorking}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            Jeg jobber fortsatt
          </button>

          <form ref={formRef} action={logoutAction}>
            <button
              type="submit"
              className="text-muted-foreground hover:text-foreground w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-neutral-800"
            >
              Logg ut
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function IdleWarningDialog({
  open,
  onStillWorking,
}: IdleWarningDialogProps) {
  if (!open) return null;
  // key={Date.now()} forces a fresh mount (and fresh countdown) every time the dialog opens
  return (
    <CountdownDialog key="idle-countdown" onStillWorking={onStillWorking} />
  );
}
