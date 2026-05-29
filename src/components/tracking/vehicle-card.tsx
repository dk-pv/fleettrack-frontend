import { Clock3, Gauge } from "lucide-react";

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
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-3.5 transition-all duration-200 ${
        active
          ? "border-blue-300 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
          : "border-border bg-background hover:border-border/80 hover:bg-muted/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold leading-tight">
            {vehicle.vehicleNumber}
          </h3>

          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {vehicle.driverName}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            vehicle.status === "OFFLINE"
              ? "bg-red-500/10 text-red-500"
              : vehicle.status === "IDLE"
                ? "bg-yellow-500/10 text-yellow-500"
                : "bg-green-500/10 text-green-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              vehicle.status === "OFFLINE"
                ? "bg-red-500"
                : vehicle.status === "IDLE"
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
          />

          {vehicle.status}
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-3.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Gauge className="h-3.5 w-3.5" />

          {vehicle.speed} km/h
        </div>

        <div className="flex items-center gap-1">
          <Clock3 className="h-3.5 w-3.5" />

          {new Date(vehicle.updatedAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}