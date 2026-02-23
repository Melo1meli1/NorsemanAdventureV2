import Image from "next/image";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

const FEATURES = [
  "Erfarne guider med lokalkunnskap",
  "Små grupper for personlig oppfølging",
  "Alt av utstyr inkludert",
  "Trygg og sikker kjøring",
  "Uforglemmelige opplevelser",
  "Fleksible betalingsløsninger",
] as const;

export function WhoAreWeSection() {
  return (
    <section className="bg-background w-full py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        {/* Left – Image with overlapping badge */}
        <div className="relative">
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg">
            <Image
              src="/tour-summer.jpg"
              alt="Motorsykkelgruppe kjører langs norsk fjordlandskap"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={85}
            />
          </div>

          {/* Overlapping badge */}
          <div className="bg-card/90 border-border absolute right-4 -bottom-8 rounded-lg border px-6 py-4 shadow-lg backdrop-blur-sm sm:right-8 sm:-bottom-10 sm:px-8 sm:py-5">
            <span className="text-primary block text-3xl font-bold sm:text-4xl">
              10+
            </span>
            <span className="text-muted-foreground text-sm sm:text-base">
              års erfaring med motorsykkelturer
            </span>
          </div>
        </div>

        {/* Right – Content */}
        <div className="flex flex-col justify-center pt-8 lg:pt-0">
          <span className="text-muted-foreground mb-2 text-sm font-medium tracking-widest uppercase">
            HVEM ER VI
          </span>
          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
            LIDENSKAP FOR <span className="text-primary">EVENTYR</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl leading-relaxed">
            Vi er en gjeng motorsykkelentusiaster som elsker å utforske verden
            på to hjul. Med over ti års erfaring tilbyr vi skreddersydde turer
            som kombinerer spektakulære landskap, uforglemmelige opplevelser og
            ekte kameratskap.
          </p>

          {/* Feature grid – 2 columns × 3 rows */}
          <div className="mb-10 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle
                  className="text-primary h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-foreground/90 text-sm sm:text-base">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/om-oss"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-colors sm:px-8 sm:text-base"
            >
              LES MER OM OSS
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/kontakt"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground inline-block rounded border-2 px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-colors sm:px-8 sm:text-base"
            >
              KONTAKT OSS
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
