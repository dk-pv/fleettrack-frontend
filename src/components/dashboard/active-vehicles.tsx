import { Truck } from "lucide-react";

import { activeVehicles } from "@/data/dashboard-data";

export default function ActiveVehicles() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="mb-6 text-lg font-semibold">
        Active Vehicles
      </h3>

      <div className="space-y-4">
        {activeVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex items-center justify-between rounded-xl bg-muted p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                <Truck className="h-5 w-5 text-blue-500" />
              </div>

              <div>
                <h4 className="font-medium">
                  {vehicle.id}
                </h4>

                <p className="text-sm text-muted-foreground">
                  {vehicle.driver}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                {vehicle.status}
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {vehicle.speed}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}