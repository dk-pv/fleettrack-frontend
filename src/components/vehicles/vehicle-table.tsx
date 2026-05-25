"use client";

import { useMemo, useState } from "react";

import {
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";

import { vehicles } from "@/data/vehicles-data";

import VehicleStatusBadge from "./vehicle-status-badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VehicleTable() {
  const [statusFilter, setStatusFilter] =
    useState("All");

  const filteredVehicles = useMemo(() => {
    if (statusFilter === "All") {
      return vehicles;
    }

    return vehicles.filter(
      (vehicle) =>
        vehicle.status === statusFilter,
    );
  }, [statusFilter]);

  return (
    <div className="rounded-xl border border-border bg-background">
      {/* Table Header */}
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-lg font-semibold">
          All Vehicles (
          {filteredVehicles.length})
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              {/* Vehicle */}
              <th className="px-5 py-4 text-sm font-semibold">
                Vehicle Number
              </th>

              {/* Driver */}
              <th className="px-5 py-4 text-sm font-semibold">
                Assigned Driver
              </th>

              {/* GPS */}
              <th className="px-5 py-4 text-sm font-semibold">
                GPS Device ID
              </th>

              {/* Status Filter */}
              <th className="px-5 py-4 text-sm font-semibold">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 transition-colors hover:text-primary">
                      Status

                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onClick={() =>
                        setStatusFilter("All")
                      }
                    >
                      All
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        setStatusFilter(
                          "Moving",
                        )
                      }
                    >
                      Moving
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        setStatusFilter(
                          "Idle",
                        )
                      }
                    >
                      Idle
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        setStatusFilter(
                          "Offline",
                        )
                      }
                    >
                      Offline
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </th>

              {/* Last Update */}
              <th className="px-5 py-4 text-sm font-semibold">
                Last Update
              </th>

              {/* Actions */}
              <th className="px-5 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredVehicles.map(
              (vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-b border-border last:border-none"
                >
                  {/* Vehicle */}
                  <td className="px-5 py-5 text-sm font-medium">
                    {vehicle.number}
                  </td>

                  {/* Driver */}
                  <td className="px-5 py-5 text-sm text-muted-foreground">
                    {vehicle.driver}
                  </td>

                  {/* GPS */}
                  <td className="px-5 py-5 text-sm text-muted-foreground">
                    {vehicle.gps}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-5">
                    <VehicleStatusBadge
                      status={
                        vehicle.status
                      }
                    />
                  </td>

                  {/* Updated */}
                  <td className="px-5 py-5 text-sm text-muted-foreground">
                    {vehicle.updated}
                  </td>

                  {/* Actions */}
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
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}