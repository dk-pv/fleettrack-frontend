import { Search, Download, Plus } from "lucide-react";

import VehicleStats from "@/components/vehicles/vehicle-stats";
import VehicleTable from "@/components/vehicles/vehicle-table";
import AddVehicleModal from "@/components/vehicles/add-vehicle-modal";

export default function VehiclesPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Vehicles</h1>

        <p className="mt-2 text-muted-foreground">
          Manage your fleet vehicles and assignments
        </p>
      </div>

      {/* Stats */}
      <VehicleStats />

      {/* Search */}
      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search vehicles, drivers, device IDs..."
              className="h-11 w-full rounded-lg border border-border bg-muted pl-10 pr-4 text-sm outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Export */}
            <button className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted">
              <Download className="h-4 w-4" />
              Export
            </button>

            {/* Add Vehicle */}
            <AddVehicleModal>
              <button className="flex h-11 items-center gap-2 rounded-lg bg-[#0f172a] px-5 text-sm font-medium text-white dark:bg-white dark:text-black">
                <Plus className="h-4 w-4" />
                Add Vehicle
              </button>
            </AddVehicleModal>
          </div>
        </div>
      </div>

      {/* Table */}
      <VehicleTable />
    </div>
  );
}
