"use client";

import { useState } from "react";
import { Search, Layers3 } from "lucide-react";
import VehicleCard from "./vehicle-card";

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

interface VehicleListProps {
  vehicles: Vehicle[];

  selected: Vehicle | null;

  onSelect: (vehicle: Vehicle | null) => void;
}

export default function VehicleList({
  vehicles,
  selected,
  onSelect,
}: VehicleListProps) {
  const [query, setQuery] = useState("");

  const filtered = vehicles.filter(
    (vehicle) =>
      vehicle.vehicleNumber.toLowerCase().includes(query.toLowerCase()) ||
      vehicle.driverName.toLowerCase().includes(query.toLowerCase()),
  );

  const movingCount = vehicles.filter(
    (vehicle) => vehicle.status === "MOVING",
  ).length;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col border-r border-border bg-background">
      {/* Header */}

      <div className="border-b border-border px-4 py-4">
        <h2 className="text-lg font-bold">Fleet Vehicles</h2>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vehicles..."
            className="h-9 w-full rounded-lg border border-border bg-muted pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-blue-400 dark:focus:border-blue-500"
          />
        </div>
      </div>

      {/* Vehicle List */}

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {/* ALL VEHICLES CARD */}

        <button
          onClick={() => onSelect(null)}
          className={`w-full rounded-xl border p-3.5 text-left transition-all duration-200 ${
            selected === null
              ? "border-blue-300 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-500/10"
              : "border-border bg-background hover:border-border/80 hover:bg-muted/40"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">All Vehicles</h3>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Show all vehicles on map
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Layers3 className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">
                {vehicles.length}
              </span>{" "}
              Total
            </div>

            <div>
              <span className="font-semibold text-green-500">
                {movingCount}
              </span>{" "}
              Moving
            </div>
          </div>
        </button>

        {/* VEHICLES */}

        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No vehicles found.
          </p>
        ) : (
          filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              active={selected?.id === vehicle.id}
              onClick={() => onSelect(vehicle)}
            />
          ))
        )}
      </div>
    </div>
  );
}
