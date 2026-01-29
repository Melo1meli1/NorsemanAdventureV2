"use client";

import type { ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  /** Custom actions (e.g. form for logout). If not set, uses onConfirm + labels. */
  actions?: ReactNode;
  /** Called when user clicks the primary confirm button. Use with confirmLabel. */
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  description,
  onClose,
  actions: customActions,
  onConfirm,
  confirmLabel = "Bekreft",
  cancelLabel = "Avbryt",
  isConfirming = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const actions =
    customActions ??
    (onConfirm && (
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isConfirming}
          className="text-sm font-medium text-neutral-300 hover:text-white disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => onConfirm()}
          disabled={isConfirming}
          className="bg-primary text-primary-foreground hover:bg-accent rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-70"
        >
          {isConfirming ? "Venter…" : confirmLabel}
        </button>
      </div>
    ));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onClick={onClose}
    >
      <div
        className="bg-card relative z-10 w-full max-w-sm rounded-2xl border border-neutral-800 px-6 py-5 shadow-xl shadow-black/40"
        role="presentation"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="mb-2 text-lg font-semibold text-white"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          className="mb-4 text-sm text-neutral-300"
        >
          {description}
        </p>
        <div className="flex justify-end gap-3">{actions}</div>
      </div>
    </div>
  );
}
