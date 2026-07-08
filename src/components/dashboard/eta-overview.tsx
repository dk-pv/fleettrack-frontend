"use client";

import Link from "next/link";

import { useEtaOverview } from "@/hooks/use-eta-overview";
import TripStatusBadge from "@/components/trips/trip-status-badge";
import { formatEtaDuration } from "@/lib/trip-eta";
import { TripEta, TripProgress } from "@/types/trip";

function arrivalTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function remainingKm(eta: TripEta | null, progress: TripProgress | null): string {
  const meters = eta?.remainingMeters ?? progress?.remainingMeters;
  return typeof meters === "number" ? `${(meters / 1000).toFixed(1)} km` : "—";
}

const th =
  "px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground";

/**
 * ETA overview across active trips (DSH-03.1 / DSH-03.2). Data comes from
 * useEtaOverview, which composes the existing trips + per-trip ETA/progress
 * endpoints (no new API, no new ETA maths). Reuses TripStatusBadge and the shared
 * formatEtaDuration; a compact row is used instead of the full TripEtaCard /
 * TripProgressCard, which aren't practical per-row in a multi-trip list.
 */
export default function EtaOverview() {
  const { rows, loading, error } = useEtaOverview();

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-sm font-semibold">Active trip ETAs</h3>
        <p className="text-xs text-muted-foreground">
          Destination ETA, distance and progress across in-transit trips
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px]">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className={th}>Trip</th>
              <th className={th}>Route</th>
              <th className={th}>Status</th>
              <th className={th}>Progress</th>
              <th className={th}>Remaining</th>
              <th className={th}>ETA</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Loading ETAs...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-destructive">
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No active trips
                </td>
              </tr>
            ) : (
              rows.map(({ trip, eta, progress }) => (
                <tr
                  key={trip.id}
                  className="border-b border-border transition-colors last:border-none hover:bg-muted/40"
                >
                  <td className="px-6 py-4 font-medium">
                    <Link
                      href={`/trips/${trip.id}`}
                      className="text-primary hover:underline"
                    >
                      {trip.reference}
                    </Link>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{trip.origin}</div>
                    <div className="text-xs text-muted-foreground">
                      to {trip.destination}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <TripStatusBadge status={trip.status} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${progress?.percentage ?? 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(progress?.percentage ?? 0)}%
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {remainingKm(eta, progress)}
                  </td>

                  <td className="px-6 py-4">
                    {eta ? (
                      <div>
                        <div className="text-sm font-semibold">
                          {arrivalTime(eta.etaTimestamp)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          in {formatEtaDuration(eta.etaSeconds)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Awaiting position
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
