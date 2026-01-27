import { EyeIcon } from "@heroicons/react/24/outline";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function AdminLoginPage() {
  return (
    <main className="bg-page-background flex min-h-screen items-center justify-center px-4">
      {/* Login card */}
      <section
        aria-labelledby="admin-login-title"
        className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 px-8 py-10 shadow-xl shadow-black/40"
      >
        {/* Logo / brand */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt="Norseman Adventures logo"
            width={48}
            height={48}
            className="rounded-full"
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

        {/* Static error area (for later use) */}
        <div
          aria-live="polite"
          className="hidden rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        >
          Feil brukernavn eller passord.
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5">
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
              className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 text-sm text-neutral-50 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
            />
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
                type="password"
                autoComplete="current-password"
                placeholder="Skriv inn passord"
                className="h-11 w-full rounded-lg border border-neutral-700 bg-neutral-900/70 px-3 pr-10 text-sm text-neutral-50 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
              />

              {/* Eye icon */}
              <button
                type="button"
                aria-label="Vis passord"
                className="absolute inset-y-0 right-3 flex items-center rounded-md text-neutral-500 hover:text-neutral-300 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
              >
                <EyeIcon className="h-5 w-5" aria-hidden="true" />
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
            className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 text-sm font-semibold tracking-wide text-neutral-950 uppercase shadow-orange-500/40 hover:bg-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
          >
            <LockClosedIcon
              className="h-5 w-5 text-neutral-950"
              aria-hidden="true"
            />
            <span>Logg inn</span>
          </button>
        </form>
      </section>
    </main>
  );
}
