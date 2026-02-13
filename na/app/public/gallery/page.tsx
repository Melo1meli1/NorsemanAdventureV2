import Image from "next/image";

export default function GalleriPage() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero: bilde går litt bak navbar, overskygget, med tittel */}
      <section
        className="relative -mt-20 min-h-[65vh] w-full overflow-hidden pt-20"
        aria-labelledby="galleri-hero-heading"
      >
        <Image
          src="/hero-motorcycle.jpg"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-black/70 via-black/40 to-black/30"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12 sm:px-10 md:px-14 lg:px-20">
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
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 md:px-10">
        <p className="text-muted-foreground">Innhold kommer her.</p>
      </div>
    </main>
  );
}
