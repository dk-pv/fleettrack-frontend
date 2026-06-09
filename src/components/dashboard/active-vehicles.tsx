import { Truck } from "lucide-react";

interface ActiveVehiclesProps {
  vehicles: any[];
}

export default function ActiveVehicles({
  vehicles,
}: ActiveVehiclesProps) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="mb-6 text-lg font-semibold">
        Active Vehicles
      </h3>

      <div className="space-y-4">
        {vehicles?.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex items-center justify-between rounded-xl bg-muted p-4"
          >
            {/* LEFT */}

            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                <Truck className="h-5 w-5 text-blue-500" />
              </div>

              <div>
                <h4 className="font-medium">
                  {
                    vehicle.vehicleNumber
                  }
                </h4>

                <p className="text-sm text-muted-foreground">
                  {
                    vehicle.driverName
                  }
                </p>
              </div>
            </div>

            {/* RIGHT */}

            <div className="text-right">
              <div
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  vehicle.status === "MOVING"
                    ? "bg-green-500/10 text-green-600"
                    : vehicle.status === "IDLE"
                      ? "bg-yellow-500/10 text-yellow-600"
                      : "bg-red-500/10 text-red-500"
                }`}
              >
                {vehicle.status}
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {vehicle.speed} km/h
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}