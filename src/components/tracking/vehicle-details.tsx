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
        flex flex-col bg-transparent
        ${mobile ? "p-1" : "h-full overflow-y-auto p-4"}
      `}
    >
      <div
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">{vehicle.vehicleNumber}</h2>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">{vehicle.driverName}</p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl border border-border bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground
              transition-all duration-200 active:scale-95 cursor-pointer
            "
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Content */}

      <div className="grid grid-cols-2 gap-3.5">
        <div className="rounded-xl border border-border bg-card/45 p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</p>

          <div className="mt-2.5">
            <span
              className={`
                inline-flex items-center gap-1.5 rounded-full
                px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border

                ${
                  vehicle.status === "MOVING"
                    ? "bg-success/10 text-success border-success/15"
                    : vehicle.status === "IDLE"
                      ? "bg-warning/10 text-warning border-warning/15"
                      : "bg-destructive/10 text-destructive border-destructive/15"
                }
              `}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${
                vehicle.status === "MOVING"
                  ? "bg-success"
                  : vehicle.status === "IDLE"
                    ? "bg-warning"
                    : "bg-destructive"
              }`} />
              {vehicle.status}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/45 p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Speed</p>

          <p className="mt-2 text-lg font-extrabold text-foreground tracking-tight">
            {Number(vehicle.speed).toFixed(1)} <span className="text-xs font-semibold text-muted-foreground">km/h</span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/45 p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Client</p>

          <p className="mt-2 text-xs font-bold text-foreground truncate">{vehicle.clientName}</p>
        </div>

        <div className="rounded-xl border border-border bg-card/45 p-3.5 shadow-xs">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">GPS Device</p>

          <p className="mt-2 text-xs font-bold text-foreground truncate">{vehicle.gpsDeviceId}</p>
        </div>
      </div>

      {/* Buttons */}

      <div className="mt-5 flex gap-3">
        <Link
          href={`/vehicles/${vehicle.id}/trips`}
          className="
            flex h-11 flex-1 items-center justify-center
            gap-2 rounded-xl border border-border bg-card/50
            text-xs font-bold hover:bg-muted text-foreground
            transition-all duration-200 active:scale-98 shadow-xs
          "
        >
          <Route className="h-4 w-4 text-muted-foreground" />
          Routes
        </Link>

        <button
          onClick={onCenterMap}
          className="
            flex h-11 flex-1 items-center justify-center
            gap-2 rounded-xl border border-border bg-card/50
            text-xs font-bold hover:bg-muted text-foreground
            transition-all duration-200 active:scale-98 shadow-xs
            cursor-pointer
          "
        >
          <LocateFixed className="h-4 w-4 text-muted-foreground" />
          Center
        </button>
      </div>
    </div>
  );
}
