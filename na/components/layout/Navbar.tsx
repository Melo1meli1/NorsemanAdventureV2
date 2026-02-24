"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Forside", href: "/" },
  { label: "Turer", href: "/public/tours" },
  { label: "Nyheter", href: "/public/news" },
  { label: "Bildegalleri", href: "/galleri" },
  { label: "Om oss", href: "/om-oss" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-1 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl"
          aria-label="Norseman Adventures - Forside"
        >
          <Image
            src="/logonew.png"
            alt="Norseman Adventures logo"
            width={40}
            height={40}
            className="h-10 w-10"
            priority
          />
          <div>
            <span className="text-white">NORSEMAN</span>
            <span className="text-primary">ADVENTURES</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex md:gap-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "text-foreground/90 text-m font-medium/80 rounded-md px-3 py-2",
                  "hover:bg-secondary hover:text-foreground transition-colors",
                  "focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Hamburger button - visible on mobile/tablet */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-md md:hidden",
            "text-foreground hover:bg-secondary focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Lukk meny" : "Åpne meny"}
        >
          <span className="sr-only">
            {mobileOpen ? "Lukk meny" : "Åpne meny"}
          </span>
          <svg
            className="size-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "border-border bg-background border-t md:hidden",
          "overflow-hidden transition-[height,opacity] duration-200 ease-out",
          mobileOpen ? "visible opacity-100" : "invisible h-0 opacity-0",
        )}
        aria-hidden={!mobileOpen}
      >
        <ul className="flex flex-col px-4 py-3">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-foreground/90 block rounded-md px-3 py-2.5 text-base font-medium",
                  "hover:bg-secondary hover:text-foreground",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
