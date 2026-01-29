"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "../actions/dashboard";
import { ConfirmDialog } from "../utils/ConfirmDialog";

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

      <ConfirmDialog
        open={showConfirm}
        title="Logg ut"
        description="Er du sikker på at du vil logge ut av administrasjonspanelet?"
        onClose={() => setShowConfirm(false)}
        actions={
          <>
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
          </>
        }
      />
    </>
  );
}
