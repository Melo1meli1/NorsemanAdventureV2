import Image from "next/image";
import { createClient } from "@/lib/supabase/supabase-server";
import { GalleryFilterBar } from "./GalleryFilterBar";

export default async function GalleriPage() {
  const supabase = await createClient();
  const { data: tours } = await supabase
    .from("tours")
    .select("id, title")
    .eq("status", "published")
    .order("title", { ascending: true });

  return (
    <main className="bg-background min-h-screen">
      {/* Hero: bilde går litt bak navbar, overskygget, tittel høyere opp, filter på bildet nederst */}
      <section
        className="relative -mt-20 min-h-[65vh] w-full overflow-hidden pt-20"
        aria-labelledby="galleri-hero-heading"
      >
        <Image
          src="/hero-motorcycle.jpg"
          alt=""
          fill
          className="object-cover object-[50%_60%]"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/30"
          aria-hidden
        />
        {/* Tittel litt høyere opp slik at filter-baren får plass under */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-28 sm:px-10 sm:pb-32 md:px-14 md:pb-36 lg:px-20 lg:pb-40">
          <h1
            id="galleri-hero-heading"
            className="text-primary text-4xl font-bold tracking-tight drop-shadow-sm sm:text-5xl md:text-6xl"
          >
            BILDEGALLERI
          </h1>
          <p className="text-foreground/95 mt-2 text-lg drop-shadow-sm sm:text-xl">
            Opplevelser fra våre turer
          </p>
        </div>
        {/* Filter: lav boks. For å flytte vertikalt: bytt bottom-0 til f.eks. bottom-4 (opp), bottom-8, bottom-12, eller -bottom-4 (ned) */}
        <div className="border-border bg-card absolute right-0 bottom-4 left-0 flex border-t px-6 pt-4 pb-5 shadow-sm sm:px-10 sm:pt-5 sm:pb-6 md:px-14 md:pt-6 md:pb-8 lg:px-20 lg:pt-8 lg:pb-10">
          <div className="w-full">
            <GalleryFilterBar tours={tours ?? []} />
          </div>
        </div>
        {/* Dekker gapet under filterbaren så hero-bildet ikke skinner gjennom (h-12 dekker opp til bottom-12) */}
        <div
          className="bg-background absolute right-0 bottom-0 left-0 h-12"
          aria-hidden
        />
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 md:px-10">
        <p className="text-muted-foreground">Innhold kommer her.</p>
      </div>
    </main>
  );
}
