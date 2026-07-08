"use client";

import { useState } from "react";
import { PackageCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { usePod } from "@/hooks/use-pod";
import FileGallery from "@/components/upload/file-gallery";
import PodSignature from "./pod-signature";

interface Props {
  tripId: string;
  /** CLIENT owns delivery confirmation (ADMIN is read-only), mirroring trip management. */
  canEdit: boolean;
}

function formatDateTime(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString() : "—";
}

/**
 * Proof of delivery (POD-01…06). Delivery-confirmation record (recipient / notes /
 * delivered-at) + proof media. Media reuses the shared upload infrastructure: photos via
 * <FileGallery category="POD_PHOTO"> and signature via <PodSignature> — no POD-specific
 * upload or storage code.
 */
export default function TripPodCard({ tripId, canEdit }: Props) {
  const { pod, loading, savePod } = usePod(tripId);
  const [editing, setEditing] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const confirmed = Boolean(pod?.deliveredAt);

  const openEdit = () => {
    setRecipientName(pod?.recipientName ?? "");
    setNotes(pod?.notes ?? "");
    setEditing(true);
  };

  const handleSave = async (confirm: boolean) => {
    try {
      setSaving(true);
      await savePod({
        recipientName: recipientName || undefined,
        notes: notes || undefined,
        // First confirmation stamps the delivery time (drives the timeline event).
        ...(confirm && !confirmed
          ? { deliveredAt: new Date().toISOString() }
          : {}),
      });
      toast.success(confirm && !confirmed ? "Delivery confirmed" : "Saved");
      setEditing(false);
    } catch (err) {
      console.log(err);
      toast.error("Failed to save proof of delivery");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Proof of Delivery</h3>
          {confirmed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
              <CheckCircle2 className="h-3 w-3" />
              Confirmed
            </span>
          )}
        </div>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={openEdit}
            className="text-sm font-medium text-primary hover:underline"
          >
            {confirmed ? "Edit" : "Confirm delivery"}
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="mt-4 space-y-6">
          {/* Confirmation details / form */}
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Received by
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Recipient name"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Delivery notes (optional)"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSave(!confirmed)}
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : confirmed
                      ? "Save"
                      : "Confirm delivery"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : confirmed ? (
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Received by</dt>
                <dd className="font-medium">{pod?.recipientName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Delivered at</dt>
                <dd className="font-medium">
                  {formatDateTime(pod?.deliveredAt ?? null)}
                </dd>
              </div>
              {pod?.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Notes</dt>
                  <dd>{pod.notes}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Delivery not yet confirmed.
            </p>
          )}

          {/* Proof media — reuses the shared upload infrastructure */}
          <FileGallery
            tripId={tripId}
            category="POD_PHOTO"
            canEdit={canEdit}
            title="Delivery photos"
            emptyLabel="No photos uploaded"
          />

          <PodSignature tripId={tripId} canEdit={canEdit} />
        </div>
      )}
    </div>
  );
}
