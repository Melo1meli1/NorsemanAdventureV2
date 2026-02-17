"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { updatePassword } from "@/app/admin/login/reset-password/actions";

type FieldErrors = {
  newPassword?: string;
  confirmPassword?: string;
};

export function AdminResetPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!newPassword || newPassword.length < 8) {
      errors.newPassword = "Passordet må være minst 8 tegn.";
    }

    if (confirmPassword !== newPassword) {
      errors.confirmPassword = "Passordene må være like.";
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("newPassword", newPassword);

      const result = await updatePassword(formData);

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push("/admin/login?reset=success");
    });
  };

  return (
    <main className="bg-page-background flex min-h-screen items-center justify-center px-4">
      <section
        aria-labelledby="admin-reset-password-title"
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
            id="admin-reset-password-title"
            className="text-2xl font-semibold text-white"
          >
            Sett nytt passord
          </h1>
          <p className="text-sm text-neutral-400">
            Velg et nytt passord for administratorkontoen din.
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-neutral-200"
            >
              Nytt passord
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Skriv inn nytt passord"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              aria-invalid={!!fieldErrors.newPassword}
              aria-describedby={
                fieldErrors.newPassword ? "newPassword-error" : undefined
              }
              className={`focus-visible:ring-ring h-11 w-full rounded-lg border px-3 text-sm text-neutral-50 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none ${
                fieldErrors.newPassword
                  ? "border-red-500 bg-neutral-900/70"
                  : "border-neutral-700 bg-neutral-900/70"
              }`}
            />
            {fieldErrors.newPassword && (
              <p id="newPassword-error" className="text-xs text-red-400">
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-neutral-200"
            >
              Gjenta nytt passord
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Gjenta nytt passord"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={
                fieldErrors.confirmPassword
                  ? "confirmPassword-error"
                  : undefined
              }
              className={`focus-visible:ring-ring h-11 w-full rounded-lg border px-3 text-sm text-neutral-50 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none ${
                fieldErrors.confirmPassword
                  ? "border-red-500 bg-neutral-900/70"
                  : "border-neutral-700 bg-neutral-900/70"
              }`}
            />
            {fieldErrors.confirmPassword && (
              <p id="confirmPassword-error" className="text-xs text-red-400">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground shadow-primary/40 hover:bg-accent focus-visible:ring-ring mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold tracking-wide uppercase focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LockClosedIcon
              className="text-primary-foreground h-5 w-5"
              aria-hidden="true"
            />
            <span>{isPending ? "Lagrer..." : "Lagre nytt passord"}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
