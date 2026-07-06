"use client";

import Link from "next/link";

import { Delay } from "@/types/delay";
import DelayCategoryBadge from "./delay-category-badge";

interface Props {
  delays: Delay[];
  loading?: boolean;
  error?: string | null;
  /** When provided, each row gets a "Details" action opening the detail modal. */
  onSelect?: (delay: Delay) => void;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}

/**
 * Delay list table (DLY-01.2) — hand-rolled table mirroring trip-table, showing
 * each delay and the trip it is associated with. Presentational only; an optional
 * onSelect surfaces the per-row detail action (DLY-03.1).
 */
export default function DelayTable({
  delays,
  loading = false,
  error,
  onSelect,
}: Props) {
  const cols = onSelect ? 7 : 6;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-6 py-4 text-sm font-semibold">Trip</th>
              <th className="px-6 py-4 text-sm font-semibold">Category</th>
              <th className="px-6 py-4 text-sm font-semibold">Reason</th>
              <th className="px-6 py-4 text-sm font-semibold">Duration</th>
              <th className="px-6 py-4 text-sm font-semibold">Reported at</th>
              <th className="px-6 py-4 text-sm font-semibold">Source</th>
              {onSelect && (
                <th className="px-6 py-4 text-sm font-semibold">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={cols}
                  className="py-10 text-center text-muted-foreground"
                >
                  Loading delays...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={cols} className="py-10 text-center text-destructive">
                  {error}
                </td>
              </tr>
            ) : delays.length === 0 ? (
              <tr>
                <td
                  colSpan={cols}
                  className="py-10 text-center text-muted-foreground"
                >
                  No delays reported
                </td>
              </tr>
            ) : (
              delays.map((delay) => (
                <tr
                  key={delay.id}
                  className="border-b border-border transition-colors last:border-none hover:bg-muted/40"
                >
                  <td className="px-6 py-4 font-medium">
                    <Link
                      href={`/trips/${delay.tripId}`}
                      className="text-primary hover:underline"
                    >
                      {delay.trip?.reference ?? delay.tripId}
                    </Link>
                  </td>

                  <td className="px-6 py-4">
                    <DelayCategoryBadge category={delay.category} />
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {delay.reason || "—"}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {delay.durationMinutes} min
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {formatDateTime(delay.reportedAt)}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {delay.source}
                  </td>

                  {onSelect && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onSelect(delay)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
