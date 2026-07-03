"use client";

interface Props {
  open: boolean;
  userName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  open,
  userName,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-card text-foreground border border-border p-6 shadow-xl">
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

        <p className="mt-2 text-xs text-red-500">
          This action cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}