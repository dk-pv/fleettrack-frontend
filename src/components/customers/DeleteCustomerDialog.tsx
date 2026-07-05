"use client";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Delete confirmation for a customer (mirrors DeleteClientDialog). */
export default function DeleteCustomerDialog({
  open,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Delete Customer?</h2>

        <p className="mt-3 text-sm text-muted-foreground">
          This action cannot be undone. This will permanently delete the
          customer.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
