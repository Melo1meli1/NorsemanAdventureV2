# Implementeringsguide: Login-autentisering

## Oversikt

Denne guiden tar deg gjennom implementeringen av login-funksjonalitet med Supabase autentisering, validering, feilhåndtering og redirects.

---

## Steg 1: Opprett Server Action for autentisering

**Fil:** `na/app/admin/login/actions.ts` (ny fil)

Opprett en Server Action som håndterer login-logikken:

```typescript
"use server";

import { supabase } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validering
  if (!email || !password) {
    return {
      error: "E-post og passord er påkrevd.",
      field: null as "email" | "password" | null,
    };
  }

  // Email-format validering
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      error: "Ugyldig e-postformat.",
      field: "email" as const,
    };
  }

  // Supabase autentisering
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Håndter spesifikke feilmeldinger
    let errorMessage = "Feil brukernavn eller passord.";

    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Feil brukernavn eller passord.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "E-postadressen er ikke bekreftet.";
    }

    return {
      error: errorMessage,
      field: null as "email" | "password" | null,
    };
  }

  // Suksess - redirect til dashboard
  if (data.user) {
    redirect("/admin/dashboard");
  }

  return {
    error: "Noe gikk galt. Prøv igjen.",
    field: null as "email" | "password" | null,
  };
}
```

---

## Steg 2: Opprett Server Component for å sjekke eksisterende session

**Fil:** `na/app/admin/login/page.tsx` (modifiser eksisterende)

Legg til en sjekk på toppen av komponenten for å redirecte brukere som allerede er innlogget:

```typescript
import { supabase } from '@/lib/supabaseClient';
import { redirect } from 'next/navigation';
import AdminLoginForm from './AdminLoginForm';

export default async function AdminLoginPage() {
  // Sjekk om bruker allerede er innlogget
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/admin/dashboard');
  }

  return <AdminLoginForm />;
}
```

---

## Steg 3: Opprett Client Component for login-skjemaet

**Fil:** `na/app/admin/login/AdminLoginForm.tsx` (ny fil)

Dette blir en client component som håndterer form state, validering og visuell feedback:

```typescript
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { loginAction } from './actions';

export default function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<'email' | 'password' | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        setFieldError(result.field);
      }
      // Hvis suksess, vil redirect skje i Server Action
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
              aria-invalid={fieldError === 'email'}
              aria-describedby={fieldError === 'email' ? 'email-error' : undefined}
              className={`focus-visible:ring-ring h-11 w-full rounded-lg border px-3 text-sm text-neutral-50 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none ${
                fieldError === 'email'
                  ? 'border-red-500 bg-neutral-900/70'
                  : 'border-neutral-700 bg-neutral-900/70'
              }`}
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
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Skriv inn passord"
                required
                aria-invalid={fieldError === 'password'}
                aria-describedby={
                  fieldError === 'password' ? 'password-error' : undefined
                }
                className={`h-11 w-full rounded-lg border px-3 pr-10 text-sm text-neutral-50 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none ${
                  fieldError === 'password'
                    ? 'border-red-500 bg-neutral-900/70'
                    : 'border-neutral-700 bg-neutral-900/70'
                }`}
              />

              {/* Eye icon - toggle password visibility */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Skjul passord' : 'Vis passord'}
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
            className="bg-primary text-primary-foreground shadow-primary/40 hover:bg-accent focus-visible:ring-ring mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold tracking-wide uppercase focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LockClosedIcon
              className="text-primary-foreground h-5 w-5"
              aria-hidden="true"
            />
            <span>{isPending ? 'Logger inn...' : 'Logg inn'}</span>
          </button>
        </form>
      </section>
    </main>
  );
}
```

---

## Steg 4: Oppdater Supabase Client for Server Components

**Fil:** `na/lib/supabaseClient.ts` (modifiser eksisterende)

Du trenger kanskje en server-side versjon av Supabase client. Sjekk om du trenger `@supabase/ssr` pakken:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side client (for bruk i client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client (for bruk i server components og server actions)
// Merk: Dette fungerer, men @supabase/ssr er anbefalt for bedre cookie-håndtering
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});
```

**Alternativt (anbefalt):** Installer `@supabase/ssr` for bedre session-håndtering:

```bash
npm install @supabase/ssr
```

Opprett `na/lib/supabase-server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
```

---

## Steg 5: Oppdater Dashboard for å sjekke autentisering

**Fil:** `na/app/admin/dashboard/page.tsx` (modifiser eksisterende)

Legg til autentiseringssjekk på toppen:

```typescript
import { supabase } from '@/lib/supabaseClient';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  // Sjekk autentisering
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  // Resten av komponenten...
  return (
    // ... eksisterende kode
  );
}
```

---

## Steg 6: Installer nødvendige pakker (hvis nødvendig)

Sjekk om du trenger `@supabase/ssr`:

```bash
cd na
npm install @supabase/ssr
```

Hvis du bruker `EyeSlashIcon`, sjekk at den er tilgjengelig i `@heroicons/react`:

```bash
npm install @heroicons/react
```

---

## Steg 7: Test implementeringen

### Test-scenarioer:

1. **Tomme felt:**
   - La feltene være tomme og klikk "Logg inn"
   - Forventet: Feilmelding om at feltene er påkrevd

2. **Ugyldig e-postformat:**
   - Skriv inn "test" i e-postfeltet
   - Forventet: Feilmelding om ugyldig e-postformat

3. **Feil passord:**
   - Skriv inn gyldig e-post, men feil passord
   - Forventet: "Feil brukernavn eller passord"

4. **Gyldig innlogging:**
   - Skriv inn korrekte credentials
   - Forventet: Redirect til `/admin/dashboard`

5. **Allerede innlogget:**
   - Logg inn, gå til `/admin/login` manuelt
   - Forventet: Automatisk redirect til dashboard

6. **Password visibility toggle:**
   - Klikk på øye-ikonet
   - Forventet: Passordet vises/skjules

---

## Filstruktur etter implementering

```
na/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   ├── page.tsx          (Server Component - sjekker session)
│   │   │   ├── AdminLoginForm.tsx (Client Component - form UI)
│   │   │   └── actions.ts        (Server Actions - login logikk)
│   │   └── dashboard/
│   │       └── page.tsx          (Server Component - sjekker auth)
│   └── ...
└── lib/
    ├── supabaseClient.ts         (Client-side Supabase)
    └── supabase-server.ts        (Server-side Supabase - hvis du bruker @supabase/ssr)
```

---

## Viktige punkter

1. **Server Actions:** Bruk Server Actions for login (ikke API routes) - dette er Next.js best practice
2. **Validering:** Valider både på klient (UX) og server (sikkerhet)
3. **Feilhåndtering:** Gi tydelige feilmeldinger til brukeren
4. **Redirects:** Bruk `redirect()` fra `next/navigation` i Server Actions
5. **Session-sjekk:** Sjekk session i både login og dashboard pages
6. **Loading states:** Bruk `useTransition` for å vise loading-state
7. **Accessibility:** Bruk `aria-invalid`, `aria-describedby` for skjermlesere

---

## Troubleshooting

**Problem:** Redirect fungerer ikke i Server Action

- **Løsning:** Sørg for at du bruker `redirect()` fra `next/navigation`, ikke `router.push()`

**Problem:** Session blir ikke persistert

- **Løsning:** Vurder å bruke `@supabase/ssr` for bedre cookie-håndtering

**Problem:** TypeScript-feil med FormData

- **Løsning:** Sørg for at du castet verdiene: `formData.get('email') as string`

**Problem:** EyeSlashIcon finnes ikke

- **Løsning:** Sjekk Heroicons versjon, eller bruk `EyeIcon` med conditional rendering

---

## Neste steg (valgfritt)

- Implementer "Glemt passord"-funksjonalitet
- Legg til "Husk meg"-funksjonalitet
- Implementer logout-funksjonalitet i dashboard
- Legg til rate limiting for login-forsøk
- Implementer 2FA (to-faktor autentisering)
