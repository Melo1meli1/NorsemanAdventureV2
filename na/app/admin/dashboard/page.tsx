import {
  Home,
  Mountain,
  Newspaper,
  ImageIcon,
  ClipboardList,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Turer", icon: Mountain },
  { label: "Nyheter", icon: Newspaper },
  { label: "Bestillinger", icon: ClipboardList },
  { label: "Galleri", icon: ImageIcon },
];

const kpiCards = [
  { label: "Totale bestillinger", value: "8", tone: "orange" },
  { label: "Bekreftet", value: "2", tone: "green" },
  { label: "Venteliste", value: "1", tone: "yellow" },
  { label: "Aktive turer", value: "5", tone: "blue" },
];

export default function AdminDashboardPage() {
  return (
    <main className="bg-page-background flex min-h-screen text-neutral-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-neutral-800 bg-neutral-950/95 md:flex">
        {/* Logo and title */}
        <div className="flex items-center gap-3 border-b border-neutral-800 px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
            <span className="text-sm font-semibold text-neutral-950">M</span>
          </div>
          <span className="text-sm font-semibold tracking-wide">ADMIN</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
          {/* Active item */}
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2.5 font-medium text-orange-200"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/90 text-neutral-950">
              <Home className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>Oversikt</span>
          </button>

          {/* Other menu items (inactive) */}
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-neutral-300 hover:bg-neutral-800/80"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900/80 text-neutral-400">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* User section */}
        <div className="space-y-3 border-t border-neutral-800 px-4 py-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-neutral-950">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-medium">admin</span>
              <span className="text-xs text-neutral-400">Administrator</span>
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-100"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Logg ut</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <section className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-700 md:hidden"
              aria-label="Åpne meny"
            >
              ☰
            </button>

            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-orange-500/90 text-neutral-950">
                <Home className="h-4 w-4" aria-hidden="true" />
              </span>
              <h1 className="text-lg font-semibold md:text-xl">Oversikt</h1>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-neutral-950 shadow-md shadow-orange-500/40 hover:bg-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none md:text-sm"
          >
            <span>Se nettside</span>
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-8">
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => (
              <article
                key={card.label}
                className="flex transform flex-col gap-3 rounded-2xl border border-orange-500/30 bg-neutral-900/90 px-5 py-4 transition hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-neutral-900"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                      card.tone === "orange"
                        ? "bg-orange-500/20 text-orange-300"
                        : card.tone === "green"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : card.tone === "yellow"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-sky-500/20 text-sky-300"
                    }`}
                  >
                    ●
                  </span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-semibold text-neutral-50">
                      {card.value}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {card.label}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Latest orders */}
          <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80">
            <header className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
              <h2 className="text-sm font-semibold md:text-base">
                Siste bestillinger
              </h2>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-orange-500/60 px-3 py-1.5 text-xs font-medium text-orange-200 hover:bg-orange-500/10"
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
                    <span className="text-xs text-neutral-400">
                      {order.tour}
                    </span>
                  </div>
                  <span className="text-xs">{order.status}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
