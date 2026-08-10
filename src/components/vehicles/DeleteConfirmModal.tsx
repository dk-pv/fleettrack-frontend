"use client";

interface Props {
  open: boolean;
  userName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  open,
  userName,
  loading,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-card text-foreground border border-border p-6 shadow-lg max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <h2 className="text-xl font-semibold">
          Delete User
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold">
            {userName}
          </span>
          ?
        </p>

        <p className="mt-2 text-xs text-destructive">
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border px-4 py-2 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-destructive px-4 py-2 text-white disabled:opacity-70"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}