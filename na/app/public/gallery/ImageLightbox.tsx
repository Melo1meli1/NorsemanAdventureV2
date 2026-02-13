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
          className="object-contain"
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
