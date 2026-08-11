"use client";

import { useId } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Shared confirmation dialog — the single implementation behind the former
 * DeleteClientDialog / DeleteCustomerDialog / users DeleteConfirmModal. Deliberately a
 * plain overlay (NOT Radix Dialog) so behavior stays byte-identical to the originals
 * (open/close, loading state, confirm/cancel). Only non-interactive a11y attributes
 * (role / aria-modal / aria-labelledby) are added.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  loadingLabel = "Deleting...",
  loading,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>

        {description && (
          <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-70"
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
