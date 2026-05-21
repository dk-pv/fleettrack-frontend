import {
  Pencil,
  Trash2,
} from "lucide-react";

import { vehicles } from "@/data/vehicles-data";

import VehicleStatusBadge from "./vehicle-status-badge";

export default function VehicleTable() {
  return (
    <div className="rounded-xl border border-border bg-background">
      {/* Table Header */}
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-lg font-semibold">
          All Vehicles (10)
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-4 text-sm font-semibold">
                Vehicle Number
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Assigned Driver
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                GPS Device ID
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Status
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Last Update
              </th>

              <th className="px-5 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="border-b border-border last:border-none"
              >
                <td className="px-5 py-5 text-sm font-medium">
                  {vehicle.number}
                </td>

                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {vehicle.driver}
                </td>

                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {vehicle.gps}
                </td>

                <td className="px-5 py-5">
                  <VehicleStatusBadge
                    status={vehicle.status}
                  />
                </td>

                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {vehicle.updated}
                </td>

                <td className="px-5 py-5">
                  <div className="flex justify-end gap-4">
                    <button>
                      <Pencil className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                    </button>

                    <button>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}