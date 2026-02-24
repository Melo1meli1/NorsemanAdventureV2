import Image from "next/image";

export function AboutSection() {
  return (
    <section className="relative z-10 -mt-16 w-full px-6 pt-4 pb-8 sm:px-8 md:px-10 lg:px-20">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left – Text */}
        <div className="flex flex-col justify-center">
          <h2 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">
            LIDENSKAP FOR <span className="text-primary">EVENTYR</span>
          </h2>
          <div className="text-muted-foreground space-y-5 leading-relaxed">
            <p>
              NorseMan Adventures ble grunnlagt av en gjeng
              motorsykkelentusiaster som deler én felles drøm: å utforske verden
              på to hjul og dele denne opplevelsen med andre.
            </p>
            <p>
              Med over 15 års erfaring og tusenvis av kilometer bak oss, tilbyr
              vi skreddersydde turer som kombinerer spektakulære landskap,
              utfordrende veier og ekte kameratskap. Fra Norges vakre fjorder
              til eksotiske destinasjoner i utlandet.
            </p>
            <p>
              Enten du er nybegynner eller erfaren, har vi turer som passer for
              deg. Våre guider sørger for at alle føler seg trygge og får en
              uforglemmelig opplevelse.
            </p>
          </div>
        </div>

        {/* Right – Image */}
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-2xl ring-1 ring-white/5">
            <Image
              src="/tour-summer.jpg"
              alt="Motorsykkelgruppe kjører langs norsk fjordlandskap"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={85}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
