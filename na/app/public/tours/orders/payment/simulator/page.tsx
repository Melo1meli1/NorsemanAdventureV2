import { Suspense } from "react";
import MockPaymentProvider from "@/app/admin/dashboard/utils/MockPaymentProvider";

export default function PaymentSimulatorPage() {
  return (
    <main className="bg-background min-h-screen">
      <div className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6 sm:pt-28">
        <Suspense>
          <MockPaymentProvider />
        </Suspense>
      </div>
    </main>
  );
}
