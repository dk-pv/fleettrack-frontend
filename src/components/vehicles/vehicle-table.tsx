"use client";

import { useMemo, useState } from "react";

import { ChevronDown, Pencil, Trash2 } from "lucide-react";

import { vehicles } from "@/data/vehicles-data";

import VehicleStatusBadge from "./vehicle-status-badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VehicleTable() {
  const [statusFilter, setStatusFilter] = useState("All");

  const [driverFilter, setDriverFilter] = useState("All");

  const [gpsFilter, setGpsFilter] = useState("All");

  const [vehicleFilter, setVehicleFilter] = useState("All");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const statusMatch =
        statusFilter === "All" || vehicle.status === statusFilter;

      const driverMatch =
        driverFilter === "All" || vehicle.driver === driverFilter;

      const gpsMatch = gpsFilter === "All" || vehicle.gps === gpsFilter;

      const vehicleMatch =
        vehicleFilter === "All" || vehicle.number === vehicleFilter;

      return statusMatch && driverMatch && gpsMatch && vehicleMatch;
    });
  }, [statusFilter, driverFilter, gpsFilter, vehicleFilter]);

  return (
    <div className="rounded-xl border border-border bg-background">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-lg font-semibold">
          All Vehicles ({filteredVehicles.length})
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              {/* Vehicle Filter */}
              <th className="px-5 py-4 text-sm font-semibold">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-primary">
                      Vehicle Number
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setVehicleFilter("All")}>
                      All
                    </DropdownMenuItem>

                    {vehicles.map((vehicle) => (
                      <DropdownMenuItem
                        key={vehicle.id}
                        onClick={() => setVehicleFilter(vehicle.number)}
                      >
                        {vehicle.number}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </th>

              {/* Driver Filter */}
              <th className="px-5 py-4 text-sm font-semibold">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-primary">
                      Assigned Driver
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setDriverFilter("All")}>
                      All
                    </DropdownMenuItem>

                    {vehicles.map((vehicle) => (
                      <DropdownMenuItem
                        key={vehicle.id}
                        onClick={() => setDriverFilter(vehicle.driver)}
                      >
                        {vehicle.driver}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </th>

              {/* GPS Filter */}
              <th className="px-5 py-4 text-sm font-semibold">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-primary">
                      GPS Device ID
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setGpsFilter("All")}>
                      All
                    </DropdownMenuItem>

                    {vehicles.map((vehicle) => (
                      <DropdownMenuItem
                        key={vehicle.id}
                        onClick={() => setGpsFilter(vehicle.gps)}
                      >
                        {vehicle.gps}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </th>

              {/* Status Filter */}
              <th className="px-5 py-4 text-sm font-semibold">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-primary">
                      Status
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setStatusFilter("All")}>
                      All
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setStatusFilter("Moving")}>
                      Moving
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setStatusFilter("Idle")}>
                      Idle
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setStatusFilter("Offline")}
                    >
                      Offline
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </th>

              {/* Updated */}
              <th className="px-5 py-4 text-sm font-semibold">Last Update</th>

              {/* Actions */}
              <th className="px-5 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredVehicles.map((vehicle) => (
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
                  <VehicleStatusBadge status={vehicle.status} />
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
