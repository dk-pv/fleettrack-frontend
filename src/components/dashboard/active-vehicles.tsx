import { Truck } from "lucide-react";

interface ActiveVehiclesProps {
  vehicles: any[];
}

export default function ActiveVehicles({
  vehicles,
}: ActiveVehiclesProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Active Vehicles
        </h3>

        <p className="text-xs text-muted-foreground mt-1">Real-time status of active fleet units</p>
      </div>

      <div className="space-y-3 mt-6">
        {vehicles?.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40"
          >
            {/* LEFT */}

            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/10">
                <Truck className="h-4.5 w-4.5 text-primary" />
              </div>

              <div>
                <h4 className="text-sm font-bold leading-none text-foreground">
                  {vehicle.vehicleNumber}
                </h4>

                <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                  {vehicle.driverName}
                </p>
              </div>
            </div>

            {/* RIGHT */}

            <div className="text-right">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${
                  vehicle.status === "MOVING"
                    ? "bg-success/10 text-success border-success/15"
                    : vehicle.status === "IDLE"
                      ? "bg-warning/10 text-warning border border-warning/15"
                      : "bg-destructive/10 text-destructive border border-destructive/15"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  vehicle.status === "MOVING"
                    ? "bg-success"
                    : vehicle.status === "IDLE"
                      ? "bg-warning"
                      : "bg-destructive"
                }`} />

                {vehicle.status}
              </div>

              <p className="mt-1.5 text-xs text-foreground font-semibold">
                {vehicle.speed} km/h
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}