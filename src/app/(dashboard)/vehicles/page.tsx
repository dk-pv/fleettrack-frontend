"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import VehicleTable from "@/components/vehicles/vehicle-table";
import AddVehicleModal from "@/components/vehicles/add-vehicle-modal";
import { useAuthStore } from "@/store/auth-store";

export default function VehiclesPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Vehicles</h1>

        <p className="mt-2 text-muted-foreground">
          Manage your fleet vehicles and assignments
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search by vehicle number, name, or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-muted/40 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user?.role !== "VIEWER" && (
              <AddVehicleModal>
                <button className="flex h-10 items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Vehicle
                </button>
              </AddVehicleModal>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <VehicleTable searchQuery={searchQuery} />
    </div>
  );
}
