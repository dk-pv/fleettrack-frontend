"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth-store";
import VehicleStatusBadge from "./vehicle-status-badge";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleNumber: string;
  gpsDeviceId: string;
  driverName: string;
  status: string;
  createdAt: string;

  client?: {
    id: string;
    name: string;
  };
}

interface VehicleTableProps {
  searchQuery?: string;
}

export default function VehicleTable({
  searchQuery = "",
}: VehicleTableProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { user } = useAuthStore();
  const router = useRouter();

  const fetchVehicles = async () => {
    try {
      const response = await apiFetch("/vehicles");
      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Data fetching on mount is a standard pattern, state is set asynchronously
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    let list = vehicles;

    if (statusFilter !== "ALL") {
      list = list.filter(
        (vehicle) => vehicle.status === statusFilter,
      );
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();

      list = list.filter(
        (vehicle) =>
          vehicle.vehicleNumber
            ?.toLowerCase()
            .includes(q) ||
          vehicle.vehicleName
            ?.toLowerCase()
            .includes(q) ||
          vehicle.driverName
            ?.toLowerCase()
            .includes(q) ||
          vehicle.client?.name
            ?.toLowerCase()
            .includes(q),
      );
    }

    return list;
  }, [vehicles, statusFilter, searchQuery]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-5">
        <h3 className="text-[18px] font-semibold text-muted-foreground">
          All Vehicles ({filteredVehicles.length})
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-xs border-b border-border z-10">
            <tr>
              <th className="px-6 py-4 text-[15px] font-semibold text-muted-foreground">
                Vehicle
              </th>

              <th className="px-6 py-4 text-[15px] font-semibold text-muted-foreground">
                Driver
              </th>

              <th className="px-6 py-4 text-[15px] font-semibold text-muted-foreground">
                GPS Device
              </th>

              {user?.role === "ADMIN" && (
                <th className="px-6 py-4 text-[15px] font-semibold text-muted-foreground">
                  Client
                </th>
              )}

              <th className="px-6 py-4 text-[15px] font-semibold text-muted-foreground">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer outline-none select-none">
                      Status
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        setStatusFilter("ALL")
                      }
                    >
                      All
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        setStatusFilter("MOVING")
                      }
                    >
                      Moving
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        setStatusFilter("IDLE")
                      }
                    >
                      Idle
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() =>
                        setStatusFilter("OFFLINE")
                      }
                    >
                      Offline
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </th>

              <th className="px-6 py-4 text-[15px] font-semibold text-muted-foreground">
                Created
              </th>

              <th className="px-6 py-4 text-right text-[15px] font-semibold text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    user?.role === "ADMIN"
                      ? 7
                      : 6
                  }
                  className="px-5 py-10 text-center text-sm text-muted-foreground"
                >
                  No vehicles found.
                </td>
              </tr>
            ) : (
              filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div>
                      <h4 className="text-[16px] font-bold text-foreground">
                        {vehicle.vehicleNumber}
                      </h4>

                      <p className="mt-1 text-[15px] text-muted-foreground font-medium">
                        {vehicle.vehicleName}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-[15px] font-medium text-foreground">
                    {vehicle.driverName}
                  </td>

                  <td className="px-6 py-5 text-[15px] font-mono text-muted-foreground">
                    {vehicle.gpsDeviceId}
                  </td>

                  {user?.role === "ADMIN" && (
                    <td className="px-6 py-5 text-[15px] font-medium text-foreground">
                      {vehicle.client?.name || "-"}
                    </td>
                  )}

                  <td className="px-6 py-5">
                    <VehicleStatusBadge
                      status={vehicle.status}
                    />
                  </td>

                  <td className="px-6 py-5 text-[15px] text-muted-foreground font-medium">
                    {new Date(
                      vehicle.createdAt,
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          router.push(
                            `/vehicles/${vehicle.id}`,
                          )
                        }
                        className="flex h-8 px-3 items-center justify-center rounded-lg border border-primary/10 bg-primary/5 hover:bg-primary/10 text-[14px] font-bold text-primary transition-all cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}