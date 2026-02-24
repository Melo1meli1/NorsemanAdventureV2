"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Våre Turer", href: "/public/tours" },
  { label: "Bildegalleri", href: "/galleri" },
  { label: "Nyheter", href: "#" },
  { label: "Om Oss & Kontakt", href: "#" },
] as const;

const SOCIAL_LINKS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
] as const;

const CONTACT_INFO = [
  {
    icon: Mail,
    text: "post@norsemanadventure.no",
    href: "mailto:post@norsemanadventure.no",
  },
  { icon: Phone, text: "+47 484 88 898 ", href: "tel:+47 484 88 898" },
  { icon: MapPin, text: "Norge", href: "#" },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("E-post er påkrevd");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Ugyldig e-postadresse");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      // TODO: Implement newsletter subscription
      console.log("Newsletter subscription:", email);
      setEmail("");
    }
  };

  return (
    <footer className="bg-card border-border w-full border-t">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo & Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logonew.png"
                alt="Norseman Adventures logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">NORSEMAN</span>
                <span className="text-primary text-lg font-bold">
                  ADVENTURES
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The Spirit of the North. Opplev eventyr på to hjul med
              uforglemmelige motorsykkelturer.
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Snarveier */}
          <div className="space-y-4">
            <h3 className="text-foreground text-base font-semibold tracking-wider uppercase">
              Snarveier
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Kontakt */}
          <div className="space-y-4">
            <h3 className="text-foreground text-base font-semibold tracking-wider uppercase">
              Kontakt
            </h3>
            <ul className="space-y-3">
              {CONTACT_INFO.map((contact) => (
                <li key={contact.text}>
                  <Link
                    href={contact.href}
                    className="text-muted-foreground hover:text-primary flex items-center gap-3 text-sm transition-colors"
                  >
                    <contact.icon className="text-primary h-4 w-4 shrink-0" />
                    <span>{contact.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Nyhetsbrev */}
          <div className="space-y-4">
            <h3 className="text-foreground text-base font-semibold tracking-wider uppercase">
              Nyhetsbrev
            </h3>
            <p className="text-muted-foreground text-sm">
              Få de siste turene og tilbudene rett i innboksen.
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Din e-post"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary flex-1 rounded border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2.5 text-sm font-semibold tracking-wider whitespace-nowrap uppercase transition-colors"
                >
                  Send
                </button>
              </div>
              {emailError && (
                <p className="text-destructive text-xs">{emailError}</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-border mt-8 border-t pt-6">
          <p className="text-muted-foreground text-center text-sm">
            © 2026 NorseMan Adventures. Alle rettigheter reservert.
          </p>
        </div>
      </div>
    </footer>
  );
}
