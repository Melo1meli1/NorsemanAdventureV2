"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "E-post",
    value: "post@norsemanadventure.no",
    href: "mailto:post@norsemanadventure.no",
  },
  {
    icon: Phone,
    label: "Telefon",
    value: "+47 484 88 898",
    href: "tel:+47 48488898",
  },
  {
    icon: MapPin,
    label: "Lokasjon",
    value: "Drammen, Norge",
    href: "#",
  },
] as const;

const SOCIAL_LINKS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
] as const;

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const isFullName = name.trim().split(/\s+/).filter(Boolean).length >= 2;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate full name
    if (!isFullName) {
      toast({
        variant: "destructive",
        title: "Skriv fullt navn",
        description: "Oppgi fornavn og etternavn.",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Ugyldig e-postadresse",
        description: "Sjekk at e-posten er korrekt.",
      });
      return;
    }

    // Validate other fields
    if (!subject.trim()) {
      toast({
        variant: "destructive",
        title: "Emne er påkrevd",
        description: "Skriv et emne for meldingen.",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Melding er påkrevd",
        description: "Skriv en melding.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            subject: subject.trim(),
            message: message.trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          toast({
            variant: "destructive",
            title: "Kunne ikke sende melding",
            description: result.error || "Prøv igjen senere.",
          });
          return;
        }

        toast({
          title: "Melding sendt!",
          description: "Vi kontakter deg så snart som mulig.",
        });

        // Reset form
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } catch (error) {
        console.error("Contact form error:", error);
        toast({
          variant: "destructive",
          title: "Kunne ikke sende melding",
          description: "Prøv igjen senere.",
        });
      }
    });
  };

  return (
    <section className="bg-card/50 w-full py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-primary mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          KONTAKT OSS
        </h2>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left – Contact info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-foreground mb-3 text-xl font-semibold">
                Kom i kontakt
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Har du spørsmål om våre turer eller ønsker å diskutere en
                skreddersydd opplevelse? Vi hører gjerne fra deg!
              </p>
            </div>

            <ul className="space-y-5">
              {CONTACT_INFO.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="group flex items-center gap-4">
                    <div className="border-primary bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border">
                      <item.icon className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-sm">
                        {item.label}
                      </span>
                      <span className="text-foreground group-hover:text-primary text-sm font-medium transition-colors">
                        {item.value}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-4 pt-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="border-border text-muted-foreground hover:border-primary hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Right – Contact form */}
          <div className="bg-card border-border rounded-xl border p-6 shadow-sm sm:p-8">
            <h3 className="text-foreground mb-6 text-xl font-semibold">
              Send oss en melding
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="text-foreground mb-1.5 block text-sm font-medium"
                  >
                    Fullt Navn <span className="text-primary">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Ditt navn"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="text-foreground mb-1.5 block text-sm font-medium"
                  >
                    E-post <span className="text-primary">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                    placeholder="din@epost.no"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="text-foreground mb-1.5 block text-sm font-medium"
                >
                  Emne <span className="text-primary">*</span>
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                  placeholder="Hva gjelder henvendelsen?"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="text-foreground mb-1.5 block text-sm font-medium"
                >
                  Melding <span className="text-primary">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full resize-y rounded border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                  placeholder="Skriv din melding her..."
                />
              </div>

              <button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPending}
              >
                <Send className="h-4 w-4" />
                Send Melding
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
