"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { requestPasswordReset } from "@/app/admin/login/forgot-password/actions";

type Step = "form" | "confirm" | "done";

type FieldErrors = {
  email?: string;
};

export function AdminForgotPasswordForm() {
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (value: string): FieldErrors => {
    const trimmed = value.trim();
    const errors: FieldErrors = {};

    if (!trimmed) {
      errors.email = "Skriv inn e-postadressen din.";
    } else if (!emailRegex.test(trimmed)) {
      errors.email = "Skriv e-post i formatet navn@firma.no.";
    }

    return errors;
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const errors = validateEmail(email);
    setFieldErrors(errors);

    if (Object.keys(errors).length === 0) {
      setStep("confirm");
    }
  };

  const handleConfirm = () => {
    setError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const formData = new FormData();
      formData.set("email", email.trim());

      const result = await requestPasswordReset(formData);

      if (result?.error) {
        if (result.field === "email") {
          setFieldErrors({ email: result.error });
        } else {
          setError(result.error);
        }
        return;
      }

      setSuccessMessage(
        "Hvis e-postadressen er registrert som admin, har vi sendt en e-post med lenke for å tilbakestille passordet.",
      );
      setStep("done");
    });
  };

  const disabled = isPending;

  return (
    <main className="bg-page-background flex min-h-screen items-center justify-center px-4">
      <section
        aria-labelledby="admin-forgot-password-title"
        className="bg-card flex w-full max-w-md flex-col gap-6 rounded-2xl border border-neutral-800 px-8 py-10 shadow-xl shadow-black/40"
      >
        {/* Logo / brand */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logonew.png"
            alt="Norseman Adventures logo"
            width={64}
            height={64}
            className=""
          />
          <p className="text-sm tracking-wide text-neutral-400">
            Norseman Adventures
          </p>
        </div>

        {/* Heading and description */}
        <header className="space-y-1 text-center">
          <h1
            id="admin-forgot-password-title"
            className="text-2xl font-semibold text-white"
          >
            Glemt passord
          </h1>
          <p className="text-sm text-neutral-400">
            Skriv inn e-postadressen din for å be om en lenke for å
            tilbakestille passordet.
          </p>
        </header>

        {/* Error / success messages */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-md border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200"
          >
            {successMessage}
          </div>
        )}

        {/* Step content */}
        {step === "form" && (
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-neutral-200"
              >
                E-postadresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Skriv inn e-postadresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className={`focus-visible:ring-ring h-11 w-full rounded-lg border px-3 text-sm text-neutral-50 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none ${
                  fieldErrors.email
                    ? "border-red-500 bg-neutral-900/70"
                    : "border-neutral-700 bg-neutral-900/70"
                }`}
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-xs text-red-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={disabled}
              className="bg-primary text-primary-foreground shadow-primary/40 hover:bg-accent focus-visible:ring-ring mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold tracking-wide uppercase focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LockClosedIcon
                className="text-primary-foreground h-5 w-5"
                aria-hidden="true"
              />
              <span>{disabled ? "Sender..." : "Neste"}</span>
            </button>
          </form>
        )}

        {step === "confirm" && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-neutral-200">
              Vil du tilbakestille passordet for{" "}
              <span className="font-semibold text-white">{email}</span>?
            </p>
            {fieldErrors.email && (
              <p className="text-xs text-red-400">{fieldErrors.email}</p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={disabled}
                onClick={() => setStep("form")}
                className="focus-visible:ring-ring h-10 w-full rounded-lg border border-neutral-700 px-4 text-sm font-medium text-neutral-200 hover:bg-neutral-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                Avbryt
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={handleConfirm}
                className="bg-primary text-primary-foreground shadow-primary/40 hover:bg-accent focus-visible:ring-ring h-10 w-full rounded-lg px-4 text-sm font-semibold tracking-wide uppercase focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {disabled ? "Sender..." : "Send lenke"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-neutral-200">
              Hvis e-postadressen{" "}
              <span className="font-semibold text-white">{email}</span> er
              registrert som admin, har vi sendt en e-post med lenke for å
              tilbakestille passordet.
            </p>
            <a
              href="/admin/login"
              className="text-xs font-medium text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline"
            >
              Tilbake til innlogging
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
