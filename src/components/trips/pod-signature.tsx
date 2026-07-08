"use client";

import { PointerEvent as ReactPointerEvent, useRef, useState } from "react";
import { Eraser, Check, PenLine } from "lucide-react";
import { toast } from "sonner";

import { useUploads } from "@/hooks/use-uploads";
import { uploadFile } from "@/services/upload.service";
import FileThumb from "@/components/upload/file-thumb";

interface Props {
  tripId: string;
  canEdit: boolean;
}

/**
 * Signature capture (POD-06). Draws on a canvas, exports a PNG blob, and uploads it
 * through the SAME shared upload flow (category POD_SIGNATURE) — no new storage path.
 * Existing signatures are listed with the reused useUploads hook + FileThumb.
 */
export default function PodSignature({ tripId, canEdit }: Props) {
  const { files, loading, reload, remove } = useUploads(tripId, "POD_SIGNATURE");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const pointFor = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    const p = pointFor(e);
    if (!ctx || !p) return;
    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const handleMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const p = pointFor(e);
    if (!ctx || !p) return;
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setDirty(true);
  };

  const handleUp = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDirty(false);
  };

  const save = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return;
    try {
      setSaving(true);
      const file = new File([blob], `signature-${tripId}.png`, {
        type: "image/png",
      });
      const res = await uploadFile({
        tripId,
        category: "POD_SIGNATURE",
        file,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast.success("Signature saved");
      clear();
      reload();
    } catch (err) {
      console.log(err);
      toast.error("Failed to save signature");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h4 className="text-sm font-semibold">Signature</h4>

      {loading ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
      ) : files.length === 0 ? (
        !canEdit && (
          <p className="mt-3 text-sm text-muted-foreground">
            No signature captured
          </p>
        )
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <FileThumb
              key={file.id}
              file={file}
              canDelete={canEdit}
              onDelete={canEdit ? remove : undefined}
            />
          ))}
        </div>
      )}

      {canEdit && (
        <div className="mt-3">
          <canvas
            ref={canvasRef}
            width={500}
            height={160}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerLeave={handleUp}
            className="w-full max-w-md touch-none rounded-lg border border-dashed border-border bg-muted/30"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save signature"}
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={!dirty || saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-muted disabled:opacity-50"
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </button>
            <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
              <PenLine className="h-3 w-3" />
              Sign above
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
