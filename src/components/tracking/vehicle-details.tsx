import { LocateFixed, Route } from "lucide-react";

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
}

export default function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col border-l border-border bg-background">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-bold">Vehicle Details</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Info Card */}
        <div className="overflow-hidden rounded-xl border border-border">
          {/* Vehicle Number */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Vehicle Number
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight">
              {vehicle.vehicleNumber}
            </h3>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Driver */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Driver
            </p>

            <p className="mt-1 text-base font-semibold">{vehicle.driverName}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Status + Speed */}
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Status
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    vehicle.status === "MOVING"
                      ? "bg-green-500/10 text-green-500"
                      : vehicle.status === "IDLE"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      vehicle.status === "MOVING"
                        ? "bg-green-500"
                        : vehicle.status === "IDLE"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />

                  {vehicle.status}
                </span>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Speed
              </p>

              <p className="mt-1 text-2xl font-bold">{vehicle.speed} km/h</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Client */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Client
            </p>

            <p className="mt-1 text-sm font-medium">{vehicle.clientName}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* GPS Device ID */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              GPS Device ID
            </p>

            <p className="mt-1 text-sm font-medium">{vehicle.gpsDeviceId}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Last Updated */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Last Updated
            </p>

            <p className="mt-1 text-sm font-medium">
              {new Date(vehicle.updatedAt).toLocaleString()}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Coordinates */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Location Coordinates
            </p>

            <p className="mt-1 font-mono text-sm font-medium">
              {vehicle.latitude}, {vehicle.longitude}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2.5">
          <button className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium transition-colors hover:bg-muted">
            <Route className="h-4 w-4" />
            View Route History
          </button>

          <button className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium transition-colors hover:bg-muted">
            <LocateFixed className="h-4 w-4" />
            Center on Map
          </button>
        </div>
      </div>
    </div>
  );
}
