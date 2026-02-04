import { Suspense } from "react";
import MockPaymentProvider from "@/app/admin/dashboard/utils/MockPaymentProvider";

export default function PaymentSimulatorPage() {
  return (
    <Suspense>
      <MockPaymentProvider />
    </Suspense>
  );
}
