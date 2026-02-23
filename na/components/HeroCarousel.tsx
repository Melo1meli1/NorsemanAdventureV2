"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide = {
  image: string;
  alt: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

const SLIDES: Slide[] = [
  {
    image: "/tour-summer.jpg",
    alt: "Motorsykler kjører langs norsk fjordlandskap om sommeren",
    title: "UTFORSK NORGES\nSKJØNNHET",
    description: "Fra fjord til fjell - opplev Norge på den beste måten",
    ctaLabel: "SOMMERTURER",
    ctaHref: "/public/tours",
  },
  {
    image: "/winter-sports.jpg",
    alt: "Skiløper på vei opp snødekt fjelltopp i Norge",
    title: "VINTERSPORT &\nAKTIVITETER",
    description: "Ski, toppturer og vinteropplevelser i verdensklasse",
    ctaLabel: "VINTERSPORT",
    ctaHref: "/public/tours",
  },
  {
    image: "/hero-motorcycle.jpg",
    alt: "Motorsyklist kjører mot solnedgang i norske fjell",
    title: "OPPLEV EVENTYR\nPÅ TO HJUL",
    description: "Uforglemmelige motorsykkelturer i Norge og utlandet",
    ctaLabel: "SE VÅRE TURER",
    ctaHref: "/public/tours",
  },
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIsAnimating(false);
    const index = emblaApi.selectedScrollSnap();
    setSelectedIndex(index);
    // Trigger fade-in after a brief reset
    const raf = requestAnimationFrame(() => setIsAnimating(true));
    return () => cancelAnimationFrame(raf);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Norseman Adventures – Høydepunkter"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative h-screen w-full overflow-hidden focus:outline-none"
    >
      {/* Embla viewport */}
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {SLIDES.map((slide, index) => (
            <div
              key={slide.image}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} av ${SLIDES.length}: ${slide.title.replace("\n", " ")}`}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              {/* Background image */}
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
                quality={85}
              />

              {/* Gradient overlay for text contrast */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20"
              />

              {/* Slide content */}
              <div
                className={cn(
                  "absolute inset-0 flex flex-col justify-end px-6 pb-28 sm:px-12 md:px-20 lg:px-28 lg:pb-32",
                  "transition-opacity duration-700 ease-out",
                  selectedIndex === index && isAnimating
                    ? "opacity-100"
                    : "opacity-0",
                )}
              >
                <div className="mb-80 flex flex-col">
                  <h2 className="text-primary mb-3 text-4xl leading-[1.05] font-extrabold tracking-tight whitespace-pre-line uppercase sm:text-5xl md:text-6xl lg:text-8xl">
                    {slide.title}
                  </h2>
                  <p className="text-foreground/90 mb-8 max-w-xl text-base font-light italic sm:text-lg md:text-xl">
                    {slide.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-6">
                    <Link
                      href={slide.ctaHref}
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground inline-block rounded border-2 px-10 py-4 text-lg font-bold tracking-wider uppercase transition-colors md:text-xl"
                    >
                      {slide.ctaLabel}
                    </Link>

                    <Link
                      href="#om-oss"
                      className="text-foreground hover:text-primary inline-block py-4 text-lg font-bold tracking-wider uppercase transition-colors md:text-xl"
                    >
                      LÆR MER OM OSS
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous / Next arrows */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Forrige slide"
        className="absolute top-1/2 left-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:left-5 sm:h-12 sm:w-12"
      >
        <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Neste slide"
        className="absolute top-1/2 right-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:right-5 sm:h-12 sm:w-12"
      >
        <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>

      {/* Pagination dots */}
      <div
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-3"
        role="tablist"
        aria-label="Velg slide"
      >
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            aria-label={`Gå til slide ${index + 1}`}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
              selectedIndex === index
                ? "bg-primary w-8"
                : "w-2.5 bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </section>
  );
}
