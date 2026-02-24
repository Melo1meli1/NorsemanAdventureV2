"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Send,
} from "lucide-react";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "E-post",
    value: "info@norsemanadventures.com",
    href: "mailto:info@norsemanadventures.com",
  },
  {
    icon: Phone,
    label: "Telefon",
    value: "+47 123 45 678",
    href: "tel:+4712345678",
  },
  {
    icon: MapPin,
    label: "Lokasjon",
    value: "Oslo, Norge",
    href: "#",
  },
] as const;

const SOCIAL_LINKS = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
] as const;

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export function ContactSection() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Navn er påkrevd";
    }

    if (!form.email.trim()) {
      newErrors.email = "E-post er påkrevd";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Ugyldig e-postadresse";
    }

    if (!form.subject.trim()) {
      newErrors.subject = "Emne er påkrevd";
    }

    if (!form.message.trim()) {
      newErrors.message = "Melding er påkrevd";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // TODO: Implement contact form submission
      console.log("Contact form:", form);
      setForm({ name: "", email: "", subject: "", message: "" });
    }
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
                    Navn <span className="text-primary">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                    placeholder="Ditt navn"
                  />
                  {errors.name && (
                    <p className="text-destructive mt-1 text-xs">
                      {errors.name}
                    </p>
                  )}
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
                    value={form.email}
                    onChange={handleChange}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                    placeholder="din@epost.no"
                  />
                  {errors.email && (
                    <p className="text-destructive mt-1 text-xs">
                      {errors.email}
                    </p>
                  )}
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
                  value={form.subject}
                  onChange={handleChange}
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                  placeholder="Hva gjelder henvendelsen?"
                />
                {errors.subject && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors.subject}
                  </p>
                )}
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
                  value={form.message}
                  onChange={handleChange}
                  className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full resize-y rounded border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
                  placeholder="Skriv din melding her..."
                />
                {errors.message && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-colors"
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
