"use client";

import Link from "next/link";

import { useLiveOps } from "@/hooks/use-live-ops";
import TripStatusBadge from "@/components/trips/trip-status-badge";
import { formatSpeed } from "@/lib/utils/format-speed";

/** Live vehicle status pill classes (mirrors the ActiveVehicles widget). */
function vehicleStatusClasses(status?: string): string {
  if (status === "MOVING")
    return "bg-success/10 text-success border-success/15";
  if (status === "IDLE") return "bg-warning/10 text-warning border-warning/15";
  return "bg-destructive/10 text-destructive border-destructive/15";
}

const th =
  "px-6 py-4 text-[15px] font-semibold text-muted-foreground";

/**
 * Live operations monitor (DSH-02.2 / DSH-02.3). Ongoing trips with their driver
 * and vehicle's live status, updating in near real time from the shared tracking
 * socket (via useLiveOps — no new API, no new socket connection). Reuses
 * TripStatusBadge and the ActiveVehicles status-pill styling.
 */
export default function LiveOperations() {
  const { ongoingTrips, liveVehicles, loading } = useLiveOps();

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <h3 className="text-[18px] font-semibold">Live operations</h3>
        <p className="text-[15px] text-muted-foreground mt-1">
          Ongoing trips with live driver &amp; vehicle status
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className={th}>Trip</th>
              <th className={th}>Route</th>
              <th className={th}>Driver</th>
              <th className={th}>Vehicle</th>
              <th className={th}>Live status</th>
              <th className={th}>Trip</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Loading operations...
                </td>
              </tr>
            ) : ongoingTrips.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No ongoing trips
                </td>
              </tr>
            ) : (
              ongoingTrips.map((trip) => {
                const live = trip.vehicleId
                  ? liveVehicles[trip.vehicleId]
                  : undefined;

                return (
                  <tr
                    key={trip.id}
                    className="border-b border-border transition-colors last:border-none hover:bg-muted/40"
                  >
                    <td className="px-6 py-5 font-medium text-[15px]">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="text-primary hover:underline"
                      >
                        {trip.reference}
                      </Link>
                    </td>

                    <td className="px-6 py-5">
                      <div className="text-[16px] font-medium">{trip.origin}</div>
                      <div className="text-[15px] text-muted-foreground">
                        to {trip.destination}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-[15px] text-muted-foreground">
                      {trip.driverName ?? live?.driverName ?? "—"}
                    </td>

                    <td className="px-6 py-5 text-[15px] text-muted-foreground">
                      {trip.vehicle?.vehicleNumber ??
                        live?.vehicleNumber ??
                        "—"}
                    </td>

                    <td className="px-6 py-5">
                      {live ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[14px] font-bold uppercase tracking-wide ${vehicleStatusClasses(
                              live.status,
                            )}`}
                          >
                            <span className="h-2 w-2 rounded-full bg-current" />
                            {live.status}
                          </span>
                          <span className="text-[15px] text-muted-foreground">
                            {formatSpeed(live.speed)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[15px] text-muted-foreground">
                          No live signal
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <TripStatusBadge status={trip.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
