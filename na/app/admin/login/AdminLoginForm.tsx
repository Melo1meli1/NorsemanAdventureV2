"use client";

import { useState, useTransition } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { loginAction } from "./actions";

export default function AdminLoginForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const password = (formData.get("password") as string | null)?.trim() ?? "";

    const newFieldErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newFieldErrors.email = "Skriv inn e-postadressen din.";
    } else if (!emailRegex.test(email)) {
      newFieldErrors.email = "Skriv e-post i formatet navn@firma.no.";
    }

    if (!password) {
      newFieldErrors.password = "Skriv inn passordet ditt.";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError(null); // to not show the global error also
      return; // dont call logicAction
    }

    startTransition(async () => {
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        if (result.field === "email") {
          setFieldErrors({ email: result.error });
        } else if (result.field === "password") {
          setFieldErrors({ password: result.error });
        }
      }
      // Upon success, the redirect happens in actions
    });
  };

  return (
    <main className="bg-pg-background flex min-h-screen items-center justify-center px-4">
      <section
        aria-labelledby="admin-login-title"
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
            id="admin-login-title"
            className="text-2xl font-semibold text-white"
          >
            Admin logg inn
          </h1>
          <p className="text-sm text-neutral-400">
            Logg inn for å administrere nettstedet.
          </p>
        </header>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email field */}
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
              required
              aria-invalid={!!fieldError.email}
              aria-describedby={fieldError.email ? "email-error" : undefined}
              className={`focus-visible:ring-ring h-11 w-full rounded-lg border px-3 text-sm text-neutral-50 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none ${
                fieldError.email
                  ? "border-red-500 bg-neutral-900/70"
                  : "border-neutral-700 bg-neutral-900/70"
              }`}
            />
            {fieldError.email && (
              <p id="email-error" className="text-xs text-red-400">
                {fieldError.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-neutral-200"
            >
              Passord
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Skriv inn passord"
                required
                aria-invalid={!!fieldError.password}
                aria-describedby={
                  fieldError.password ? "password-error" : undefined
                }
                className={`h-11 w-full rounded-lg border px-3 pr-10 text-sm text-neutral-50 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none ${
                  fieldError.password
                    ? "border-red-500 bg-neutral-900/70"
                    : "border-neutral-700 bg-neutral-900/70"
                }`}
              />

              {/* Eye icon - toggle password visibility */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Skjul passord" : "Vis passord"}
                className="focus-visible:ring-ring absolute inset-y-0 right-3 flex items-center rounded-md text-neutral-500 hover:text-neutral-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot password link */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs font-medium text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline"
            >
              Glemt passord?
            </button>
          </div>

          {/* Primary login button */}
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground shadow-primary/40 hover:bg-accent focus-visible:ring-ring mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold tracking-wide uppercase focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LockClosedIcon
              className="text-primary-foreground h-5 w-5"
              aria-hidden="true"
            />
            <span>{isPending ? "Logger inn..." : "Logg inn"}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
