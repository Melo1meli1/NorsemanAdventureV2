"use client";

export function OrdersView() {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-neutral-400">
            Se og administrer alle bestillinger.
          </p>
        </div>
      </header>

      <div className="bg-card border-primary/20 rounded-[18px] border px-5 py-8">
        <p className="text-center text-sm text-neutral-400">
          Bestillingstabell kommer her.
        </p>
      </div>
    </section>
  );
}
