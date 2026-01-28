"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "./actions";

export function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 text-sm font-semibold text-white hover:text-white/80"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        <span>LOGG UT</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-neutral-800 px-6 py-5 shadow-xl shadow-black/40">
            <h2 className="mb-2 text-lg font-semibold text-white">Logg ut</h2>
            <p className="mb-4 text-sm text-neutral-300">
              Er du sikker på at du vil logge ut av administrasjonspanelet?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="text-sm font-medium text-neutral-300 hover:text-white"
              >
                Avbryt
              </button>

              {/* Viktig: form med action={logoutAction} */}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-accent rounded-lg px-4 py-2 text-sm font-semibold"
                >
                  Ja, logg meg ut
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
