## Når bruker vi hva?

### `supabase-server.ts` (SSR‑klienten)

**Brukes nå til:**

- `loginAction`
- `logoutAction`
- `admin/login/page.tsx` (session‑sjekk)
- `admin/dashboard/page.tsx` (route‑beskyttelse)

Dette er riktig for autentisering og session, fordi den leser/oppdaterer cookies på serveren.

### `supabaseClient.ts` (vanlig klient‑JS)

**Er til for klient-side ting i fremtiden, f.eks.:**

- Realtime‑oppdateringer i dashboardet
- Hente/lage data fra React client components utenom auth

Per nå kan den være ubrukt, og det er greit. Du kan:

- La den ligge til senere bruk, eller
- Slette den nå og lage den igjen senere hvis du trenger Supabase direkte i en client component.

**Kort oppsummert:**  
For login, logout og route‑sikkerhet skal du holde deg til `supabase-server`.  
`supabaseClient` er kun nyttig hvis du etter hvert vil gjøre ting fra ren klient‑kode (f.eks. live‑UI inne i dashboardet).
