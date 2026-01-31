# Tailwind CSS – hot reload slutter å oppdatere

Dette prosjektet bruker **Next 16**, **Tailwind v4** og **Turbopack**. Det er kjent at Tailwind-stiler noen ganger slutter å oppdatere i dev uten at du restarter serveren (JIT/content-scanning eller caching).

## 1) Rask diagnostikk (2 min)

Når f.eks. `px-4` → `px-2` «ikke virker», sjekk i DevTools på elementet:

| Sjekk                                              | Hvis ja →                                                                         | Hvis nei →                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **A:** Endrer `class` i DOM seg til `px-2`?        | React/Fast Refresh virker, men **CSS er utdatert** (Tailwind bygger ikke ny CSS). | Komponenten oppdateres ikke (React/Fast Refresh-issue).     |
| **B:** Endrer «Computed» `padding-left/right` seg? | Alt fungerer.                                                                     | **Tailwind CSS blir ikke regenerert** eller lastet på nytt. |

- **A ja, B nei** → typisk Tailwind/build-cache (bruk løsning 2 eller 3).
- **A nei** → fokus på React/Next, ikke Tailwind.

## 2) Løsninger å prøve (i rekkefølge)

### A) Tøm cache og start dev på nytt

Ofte nok når Tailwind «fryser» på gamle utility-klasser:

```bash
cd na
npm run dev:clean
```

Dette sletter `.next` (og cache) og starter `next dev --turbo` på nytt.

### B) Prøv uten Turbopack (webpack)

Turbopack + Tailwind har hatt HMR-bugs (f.eks. at klasser ikke oppdateres før restart). Test om problemet forsvinner med webpack:

```bash
cd na
npm run dev:webpack
```

Hvis hot reload da fungerer stabilt, er **Turbopack** sannsynligvis årsaken. Da kan du kjøre `dev:webpack` i perioder der du jobber mye med Tailwind.

### C) Fil-overvåking med polling (Docker / WSL / nettverksdisk)

Hvis prosjektet ligger på et filsystem der file-watchers ikke alltid får events (f.eks. WSL, Docker, nettverksdisk), kan Tailwind slutte å se endringer. Da:

```bash
cd na
npm run dev:polling
```

## 3) Bytte til vanlig CSS?

- **Hvis DevTools viser:** `class` endres til f.eks. `px-2`, men computed padding endres ikke → **vanlig CSS vil ofte «virke»** fordi det ikke avhenger av Tailwind sin JIT-scan.
- Det **fikser ikke** underliggende file-watching/cache-problemer; det bare unngår Tailwind sin del av kjeden. Derfor: bruk løsning 2 først, og bytt til vanlig CSS kun hvis du vil redusere avhengighet til Tailwind i dev.

## 4) Versjoner (for feilrapporter)

- Next: `npm ls next`
- Tailwind: `npm ls tailwindcss`
- Kjører du Docker/WSL? (ja/nei)
- Når det «ikke virker»: i DevTools – endres `class` til den nye (f.eks. `px-2`), eller står den fortsatt på den gamle (f.eks. `px-4`)?

Med disse tre punktene kan man peke på én konkret løsning (polling vs cache vs Turbopack vs config).
