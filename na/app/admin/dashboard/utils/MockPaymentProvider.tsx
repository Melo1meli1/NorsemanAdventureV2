"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function MockPaymentProvider() {
  const searchParams = useSearchParams();
  const refId = searchParams.get("ref"); // Booking ID vi sendte med
  const [status, setStatus] = useState("Waiting...");

  const handlePayment = async () => {
    setStatus("Processing payment...");

    // Her simulerer vi at LetsReg kaller  Webhook
    const res = await fetch("/api/webhooks/letsreg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference_id: refId,
        status: "COMPLETED", // later som betalingen gikk bra
        transaction_id: "mock_trans_123",
      }),
    });

    if (res.ok) {
      // Send brukeren tilbake til  "Success"-side
      window.location.href = `/admin/dashboard/orders/success?bookingId=${refId}`;
    } else {
      setStatus("Webhook failed!");
    }
  };

  return (
    <div className="m-10 border-4 border-red-500 p-10">
      <h1 className="text-2xl font-bold text-red-600">LETSREG SIMULATOR</h1>
      <p>Dette er en falsk betalingsside for testing.</p>
      <p>Booking ID: {refId}</p>
      <button
        onClick={handlePayment}
        className="mt-4 rounded bg-green-600 p-4 text-white"
      >
        Simuler Vellykket Betaling (NOK 5000,-)
      </button>
      <div className="mt-4">{status}</div>
    </div>
  );
}
