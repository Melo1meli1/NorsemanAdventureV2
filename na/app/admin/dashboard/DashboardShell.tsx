"use client";

import { useState } from "react";
import {
  Home,
  Mountain,
  Newspaper,
  ImageIcon,
  ClipboardList,
  BookOpen,
  Users,
  MapPin,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

const navItems = [
  { id: "overview", label: "Oversikt", icon: Home },
  { id: "tours", label: "Turer", icon: Mountain },
  { id: "news", label: "Nyheter", icon: Newspaper },
  { id: "orders", label: "Bestillinger", icon: ClipboardList },
  { id: "gallery", label: "Galleri", icon: ImageIcon },
];

const kpiCards = [
  { label: "Totale bestillinger", value: "8", tone: "orange", Icon: BookOpen },
  { label: "Bekreftet", value: "2", tone: "green", Icon: Users },
  { label: "Venteliste", value: "1", tone: "yellow", Icon: Users },
  { label: "Aktive turer", value: "5", tone: "blue", Icon: MapPin },
];

export function DashboardShell() {
  const [activeSection, setActiveSection] = useState<
    "overview" | "tours" | "news" | "orders" | "gallery"
  >("overview");

  return (
    <main className="bg-page-background flex min-h-screen text-neutral-50">
      {/* Sidebar */}
      <aside className="bg-card hidden w-64 flex-col border-r border-neutral-800 md:flex">
        <div className="flex items-center gap-3 border-b border-neutral-800 px-6 py-5">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
            <span className="text-primary-foreground text-sm font-semibold">
              M
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide">ADMIN</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (id === "overview" || id === "tours") {
                  setActiveSection(id);
                }
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium ${
                activeSection === id
                  ? "bg-primary text-primary-foreground"
                  : "text-neutral-300 hover:bg-neutral-800/80"
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                  activeSection === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-neutral-900/80 text-neutral-400"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-3 border-t border-neutral-800 px-4 py-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white">admin</span>
              <span className="text-xs text-neutral-400">Administrator</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <section className="flex flex-1 flex-col">
        <header className="bg-page-background flex items-center justify-between border-b border-neutral-800 px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-700 md:hidden"
              aria-label="Åpne meny"
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold md:text-xl">
              {activeSection === "overview" ? "Oversikt" : "Turer "}
            </h1>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-8">
          {activeSection === "overview" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((card) => (
                  <article
                    key={card.label}
                    className="bg-card hover:bg-card/90 border-primary/30 hover:border-primary/60 flex transform flex-col justify-center rounded-[18px] border px-6 py-4 transition hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          card.tone === "orange"
                            ? "bg-primary/20 text-primary"
                            : card.tone === "green"
                              ? "bg-green-500/20 text-green-400"
                              : card.tone === "yellow"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        <card.Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-neutral-50">
                          {card.value}
                        </span>
                        <span className="text-sm text-neutral-400">
                          {card.label}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <section className="bg-card border-primary/20 overflow-hidden rounded-[18px] border">
                <header className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
                  <h2 className="text-sm font-semibold md:text-base">
                    Siste bestillinger
                  </h2>
                  <button
                    type="button"
                    className="border-primary/60 text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium"
                  >
                    <span>Se alle</span>
                    <span>›</span>
                  </button>
                </header>
                <ul className="divide-y divide-neutral-800 text-sm">
                  {[
                    {
                      name: "Ole Nordmann",
                      tour: "Nordkapp Ekspedisjon",
                      status: "Venteliste",
                    },
                    {
                      name: "Kari Hansen",
                      tour: "Nordkapp Ekspedisjon",
                      status: "Bekreftet",
                    },
                    {
                      name: "Per Olsen",
                      tour: "Grusveiene i Setesdal",
                      status: "Venteliste",
                    },
                  ].map((order) => (
                    <li
                      key={order.name}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-neutral-50">
                          {order.name}
                        </span>
                        <span className="text-sm text-neutral-400">
                          {order.tour}
                        </span>
                      </div>
                      <span className="text-xs font-medium">
                        {order.status === "Bekreftet" ? (
                          <span className="bg-primary/20 text-primary rounded-full px-2 py-1">
                            {order.status}
                          </span>
                        ) : (
                          <span className="rounded-full bg-neutral-800 px-2 py-1 text-neutral-300">
                            {order.status}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {activeSection === "tours" && (
            <div>
              <p className="text-sm text-neutral-400">
                Turer-seksjon. TourList / ToursView kan kobles inn her.
              </p>
            </div>
          )}

          {activeSection === "news" && (
            <div>
              <p className="text-sm text-neutral-400">
                Nyheter-seksjon. NewsList / NewsView kan kobles inn her.
              </p>
            </div>
          )}

          {activeSection === "orders" && (
            <div>
              <p className="text-sm text-neutral-400">
                Bestillinger-seksjon. OrdersList / OrdersView kan kobles inn
                her.
              </p>
            </div>
          )}

          {activeSection === "gallery" && (
            <div>
              <p className="text-sm text-neutral-400">
                Galleri-seksjon. GalleryList / GalleryView kan kobles inn her.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
