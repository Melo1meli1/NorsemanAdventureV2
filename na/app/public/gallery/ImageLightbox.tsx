/*
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageLightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [visible, setVisible] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (mountedRef.current) setVisible(true);
      });
    });
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-200 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Forstørret bilde"
      onClick={onClose}
    >
      <div
        className="relative z-10 h-[80vh] w-full max-w-[80vw] transition-opacity duration-200 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover" //SE TILBAKE
          sizes="100vw"
          onClick={(e) => e.stopPropagation()}
          unoptimized
        />
      </div>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/80"
        onClick={onClose}
        aria-label="Lukk"
      >
        <X className="h-5 w-5" aria-hidden />
      </Button>
    </div>
  );
}
*/
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type LightboxImage = {
  src: string;
  alt: string;
};

type ImageLightboxProps = {
  images: LightboxImage[];
  selectedIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function ImageLightbox({
                                images,
                                selectedIndex,
                                onClose,
                                onPrev,
                                onNext,
                              }: ImageLightboxProps) {
  const [visible, setVisible] = useState(false);
  const mountedRef = useRef(true);
  const touchStartX = useRef<number | null>(null);

  const image = images[selectedIndex];

  useEffect(() => {
    mountedRef.current = true;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (mountedRef.current) setVisible(true);
      });
    });

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 50;

    if (diff > threshold) onNext();
    if (diff < -threshold) onPrev();

    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-200 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Forstørret bilde"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Forrige bilde"
        className="absolute top-1/2 left-4 z-20 hidden -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 md:block"
      >
        <ChevronLeft className="h-7 w-7" />
      </button>

      <div
        className="relative z-10 h-[80vh] w-full max-w-[80vw] transition-opacity duration-200 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-contain"
          sizes="100vw"
          onClick={(e) => e.stopPropagation()}
          unoptimized
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Neste bilde"
        className="absolute top-1/2 right-4 z-20 hidden -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 md:block"
      >
        <ChevronRight className="h-7 w-7" />
      </button>

      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/80"
        onClick={onClose}
        aria-label="Lukk"
      >
        <X className="h-5 w-5" aria-hidden />
      </Button>
    </div>
  );
}