import { Clock3, Gauge } from "lucide-react";

import { formatSpeed } from "@/lib/utils/format-speed";

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

interface VehicleCardProps {
  vehicle: Vehicle;
  active?: boolean;
  onClick?: () => void;
}

export default function VehicleCard({
  vehicle,
  active = false,
  onClick,
}: VehicleCardProps) {
  const isIdle = vehicle.status === "IDLE";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-3 transition-colors duration-150 select-none ${
        active
          ? "border-primary bg-primary/5 dark:border-primary/10"
          : "border-border bg-card hover:bg-muted/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-semibold leading-none text-foreground">
            {vehicle.vehicleNumber}
          </h3>

          <p className="mt-1.5 truncate text-[11px] font-semibold text-muted-foreground">
            {vehicle.driverName}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase border ${
            vehicle.status === "OFFLINE"
              ? "bg-destructive/10 text-destructive border-destructive/15"
              : isIdle
                ? "bg-warning/10 text-warning border border-warning/15"
                : "bg-success/10 text-success border border-success/15"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              vehicle.status === "OFFLINE"
                ? "bg-destructive"
                : isIdle
                  ? "bg-warning"
                  : "bg-success"
            }`}
          />
          {vehicle.status}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <Gauge className="h-3.5 w-3.5" />
          <span>{formatSpeed(vehicle.speed)}</span>
        </div>

        <div className="flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" />
          <span>{new Date(vehicle.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}