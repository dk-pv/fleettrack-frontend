"use client";

import Link from "next/link";
import { LocateFixed, Route, X } from "lucide-react";

import { roundSpeed } from "@/lib/utils/format-speed";
import type { Vehicle } from "./tracking-map";

interface VehiclePopupCardProps {
  vehicle: Vehicle;
  onCenterMap: () => void;
  onClose: () => void;
}

/**
 * The compact map popup that replaced the full-height VehicleDetails drawer on /tracking.
 * It carries the same facts the drawer did (status, speed, client, device, last fix, and
 * the Trips / Center actions) at popup scale, so the map keeps the whole width.
 *
 * VehicleDetails is NOT deleted — /tracking/[id] is a single-vehicle page whose side panel
 * is the point of the route, so it still uses it.
 */
export default function VehiclePopupCard({
  vehicle,
  onCenterMap,
  onClose,
}: VehiclePopupCardProps) {
  // Full class strings, not `bg-${tone}/10` — Tailwind scans source text, so a class name
  // built at runtime is never generated. Same tones as VehicleCard / VehicleDetails.
  const tone =
    vehicle.status === "MOVING"
      ? {
          pill: "bg-success/10 text-success border-success/15",
          dot: "bg-success",
        }
      : vehicle.status === "IDLE"
        ? {
            pill: "bg-warning/10 text-warning border-warning/15",
            dot: "bg-warning",
          }
        : {
            pill: "bg-destructive/10 text-destructive border-destructive/15",
            dot: "bg-destructive",
          };

  return (
    // The click guard keeps a click INSIDE the card from reaching the map, which would
    // otherwise clear the selection and close the card the user is reading.
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-[248px] select-none rounded-lg border border-border bg-card shadow-lg animate-in fade-in-50 zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-3 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-semibold leading-none text-foreground">
            {vehicle.vehicleNumber}
          </h3>
          <p className="mt-1.5 truncate text-[11px] font-semibold text-muted-foreground">
            {vehicle.driverName}
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close vehicle details"
          className="-mr-1 -mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer outline-none"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Status + speed */}
      <div className="mt-3 flex items-center justify-between gap-2 px-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${tone.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
          {vehicle.status}
        </span>

        <p className="text-[13px] font-semibold tabular-nums text-foreground">
          {roundSpeed(vehicle.speed)}{" "}
          <span className="text-[10px] font-semibold text-muted-foreground">
            km/h
          </span>
        </p>
      </div>

      {/* Facts */}
      <dl className="mt-3 space-y-1.5 border-t border-border px-3 pt-2.5 text-[11px]">
        {vehicle.client?.name && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="font-semibold text-muted-foreground">Client</dt>
            <dd className="truncate font-semibold text-foreground">
              {vehicle.client.name}
            </dd>
          </div>
        )}

        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-semibold text-muted-foreground">Device</dt>
          <dd className="truncate font-semibold text-foreground">
            {vehicle.gpsDeviceId}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-semibold text-muted-foreground">Last fix</dt>
          <dd className="font-semibold tabular-nums text-foreground">
            {new Date(vehicle.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </dd>
        </div>
      </dl>

      {/* Actions */}
      <div className="mt-3 flex gap-2 border-t border-border p-2.5">
        <Link
          href="/trips"
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-[11px] font-bold text-foreground transition-colors hover:bg-muted"
        >
          <Route className="h-3.5 w-3.5 text-muted-foreground" />
          Trips
        </Link>

        <button
          onClick={onCenterMap}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-[11px] font-bold text-foreground transition-colors hover:bg-muted cursor-pointer outline-none"
        >
          <LocateFixed className="h-3.5 w-3.5 text-muted-foreground" />
          Center
        </button>
      </div>
    </div>
  );
}
