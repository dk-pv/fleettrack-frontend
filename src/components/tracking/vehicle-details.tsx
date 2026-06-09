"use client";

import Link from "next/link";
import { LocateFixed, Route, X } from "lucide-react";
interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleNumber: string;
  gpsDeviceId: string;
  driverName: string;
  clientName: string;
  status: string;
  latitude: number;
  longitude: number;
  speed: number;
  updatedAt: string;
}

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onCenterMap: () => void;
  onClose: () => void;
  mobile?: boolean;
}

export default function VehicleDetails({
  vehicle,
  onCenterMap,
  onClose,
  mobile = false,
}: VehicleDetailsProps) {
  return (
    <div
      className={`
        flex flex-col bg-background
${mobile ? "p-4" : "h-full overflow-y-auto p-4"}`}
    >
      <div
        className={`
          flex items-center justify-between

        ${mobile ? "mb-4" : "mb-4"}
        `}
      >
        <div>
          <h2 className="text-lg font-bold">{vehicle.vehicleNumber}</h2>
          <p className="text-sm text-muted-foreground">{vehicle.driverName}</p>
        </div>

        <button
          onClick={onClose}
          className="
            flex h-8 w-8 items-center justify-center
            rounded-lg hover:bg-muted
          "
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Status</p>

          <div className="mt-2">
            <span
              className={`
                inline-flex items-center gap-1 rounded-full
                px-2.5 py-1 text-xs font-medium

                ${
                  vehicle.status === "MOVING"
                    ? "bg-green-500/10 text-green-500"
                    : vehicle.status === "IDLE"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-red-500/10 text-red-500"
                }
              `}
            >
              {vehicle.status}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Speed</p>

          <p className="mt-2 text-lg font-bold">{Number(vehicle.speed).toFixed(1)} km/h</p>
        </div>

        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Client</p>

          <p className="mt-2 text-sm font-medium">{vehicle.clientName}</p>
        </div>

        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">GPS Device</p>

          <p className="mt-2 text-sm font-medium">{vehicle.gpsDeviceId}</p>
        </div>
      </div>

      {/* Buttons */}

      <div className="mt-4 flex gap-2">
        <Link
          href={`/vehicles/${vehicle.id}/trips`}
          className="
            flex h-10 flex-1 items-center justify-center
            gap-2 rounded-xl border border-border
            text-sm font-medium hover:bg-muted
          "
        >
          <Route className="h-4 w-4" />
          Routes
        </Link>

        <button
          onClick={onCenterMap}
          className="
            flex h-10 flex-1 items-center justify-center
            gap-2 rounded-xl border border-border
            text-sm font-medium hover:bg-muted
          "
        >
          <LocateFixed className="h-4 w-4" />
          Center
        </button>
      </div>
    </div>
  );
}
