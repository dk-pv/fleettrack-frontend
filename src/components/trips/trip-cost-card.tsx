"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";

import { useTripCost } from "@/hooks/use-trip-cost";
import { COST_COMPONENT_META, costAmount } from "@/types/trip-cost";
import TripCostModal from "./trip-cost-modal";
import FileGallery from "@/components/upload/file-gallery";

interface Props {
  tripId: string;
  /** CLIENT owns cost entry (ADMIN is read-only), mirroring trip management. */
  canEdit: boolean;
}

function formatMoney(value: number): string {
  return Math.round(value).toLocaleString();
}

/** Signed variance label (+ over budget / − under budget). */
function formatVariance(value: number): string {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded.toLocaleString()}`;
}

/** Over budget (actual > estimated) reads red; under budget reads green. */
function varianceClass(value: number): string {
  if (value > 0) return "text-destructive";
  if (value < 0) return "text-success";
  return "text-muted-foreground";
}

/**
 * Trip cost breakdown (TCM-01.4 / TCM-02.3 / TCM-04.3). Self-contained (loads via
 * useTripCost); shows estimated, actual and the server-derived variance per
 * component + totals, with a CLIENT-only edit opening the cost form.
 */
export default function TripCostCard({ tripId, canEdit }: Props) {
  const { cost, variance, loading, saveCost } = useTripCost(tripId);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Costs</h3>
        </div>
        {canEdit && (
          <button
            onClick={() => setEditOpen(true)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {cost ? "Edit" : "Add costs"}
          </button>
        )}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading costs...</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="pb-2 text-left font-medium">Component</th>
                <th className="pb-2 text-right font-medium">Estimated</th>
                <th className="pb-2 text-right font-medium">Actual</th>
                <th className="pb-2 text-right font-medium">Variance</th>
              </tr>
            </thead>

            <tbody>
              {COST_COMPONENT_META.map((c) => (
                <tr key={c.key} className="border-t border-border">
                  <td className="py-2 text-muted-foreground">{c.label}</td>
                  <td className="py-2 text-right">
                    {formatMoney(costAmount(cost, c.estimatedField))}
                  </td>
                  <td className="py-2 text-right">
                    {formatMoney(costAmount(cost, c.actualField))}
                  </td>
                  <td
                    className={`py-2 text-right font-medium ${varianceClass(
                      variance[c.key],
                    )}`}
                  >
                    {formatVariance(variance[c.key])}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t border-border font-semibold">
                <td className="pt-2">Total</td>
                <td className="pt-2 text-right">
                  {formatMoney(variance.estimatedTotal)}
                </td>
                <td className="pt-2 text-right">
                  {formatMoney(variance.actualTotal)}
                </td>
                <td className={`pt-2 text-right ${varianceClass(variance.total)}`}>
                  {formatVariance(variance.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Receipts (TCM-03) — the trip's RECEIPT-category files via the shared gallery. */}
      <div className="mt-6 border-t border-border pt-4">
        <FileGallery
          tripId={tripId}
          category="RECEIPT"
          canEdit={canEdit}
          title="Receipts"
          emptyLabel="No receipts uploaded"
        />
      </div>

      {editOpen && (
        <TripCostModal
          open
          onClose={() => setEditOpen(false)}
          cost={cost}
          onSave={saveCost}
        />
      )}
    </div>
  );
}
