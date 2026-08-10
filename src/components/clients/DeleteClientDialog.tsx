"use client";

interface Props {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteClientDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <h2 className="text-lg font-semibold">Delete Client?</h2>

        <p className="mt-3 text-sm text-muted-foreground">
          This action cannot be undone. This will permanently delete the client
          and related data.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-destructive px-5 py-2.5 text-sm font-medium text-white hover:bg-destructive/90 disabled:opacity-70"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}