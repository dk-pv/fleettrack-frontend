"use client";

import Link from "next/link";

import { Trip } from "@/types/trip";
import TripStatusBadge from "./trip-status-badge";

interface Props {
  trips: Trip[];
  loading?: boolean;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function TripTable({ trips, loading = false }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left">
              <th className="px-6 py-5 text-[15px] font-semibold">Reference</th>
              <th className="px-6 py-5 text-[15px] font-semibold">Route</th>
              <th className="px-6 py-5 text-[15px] font-semibold">Vehicle</th>
              <th className="px-6 py-5 text-[15px] font-semibold">Driver</th>
              <th className="px-6 py-5 text-[15px] font-semibold">Planned start</th>
              <th className="px-6 py-5 text-[15px] font-semibold">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  Loading trips...
                </td>
              </tr>
            ) : trips.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No trips yet
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <tr
                  key={trip.id}
                  className="border-b border-border last:border-none transition-colors hover:bg-muted/40"
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
                    <div className="text-[15px] text-muted-foreground mt-0.5">
                      to {trip.destination}
                      {trip.stops.length > 0 &&
                        ` · ${trip.stops.length} stop${
                          trip.stops.length > 1 ? "s" : ""
                        }`}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-[15px] text-muted-foreground">
                    {trip.vehicle?.vehicleNumber ?? "—"}
                  </td>

                  <td className="px-6 py-5 text-[15px] text-muted-foreground">
                    {trip.driverName ?? "—"}
                  </td>

                  <td className="px-6 py-5 text-[15px] text-muted-foreground">
                    {formatDateTime(trip.scheduledStart)}
                  </td>

                  <td className="px-6 py-5">
                    <TripStatusBadge status={trip.status} />
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
