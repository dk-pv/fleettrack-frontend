"use client";

import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import { useAuthStore } from "@/store/auth-store";
import VehicleStatusBadge from "./vehicle-status-badge";
import AddVehicleModal from "./add-vehicle-modal";
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
  clientName: string;
  status: string;
  createdAt: string;
}

export default function VehicleTable() {
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
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    if (statusFilter === "ALL") {
      return vehicles;
    }

    return vehicles.filter((vehicle) => vehicle.status === statusFilter);
  }, [vehicles, statusFilter]);

  const deleteVehicle = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this vehicle?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await apiFetch(`/vehicles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Vehicle deleted");

        fetchVehicles();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);

      alert("Server error");
    }
  };

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
              <th className="px-5 py-4 text-sm font-semibold">Vehicle</th>

              <th className="px-5 py-4 text-sm font-semibold">Driver</th>

              <th className="px-5 py-4 text-sm font-semibold">GPS Device</th>

              <th className="px-5 py-4 text-sm font-semibold">Client</th>

              <th className="px-5 py-4 text-sm font-semibold">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-primary">
                      Status
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                      All
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setStatusFilter("MOVING")}>
                      Moving
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setStatusFilter("IDLE")}>
                      Idle
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => setStatusFilter("OFFLINE")}
                    >
                      Offline
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </th>

              <th className="px-5 py-4 text-sm font-semibold">Created</th>

              {user?.role !== "VIEWER" && (
                <th className="px-5 py-4 text-right text-sm font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="border-b border-border last:border-none"
              >
                <td className="px-5 py-5">
                  <div>
                    <h4 className="text-sm font-semibold">
                      {vehicle.vehicleNumber}
                    </h4>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {vehicle.vehicleName}
                    </p>
                  </div>
                </td>

                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {vehicle.driverName}
                </td>

                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {vehicle.gpsDeviceId}
                </td>

                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {vehicle.clientName}
                </td>

                <td className="px-5 py-5">
                  <VehicleStatusBadge status={vehicle.status} />
                </td>

                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {new Date(vehicle.createdAt).toLocaleDateString()}
                </td>

                {user?.role !== "VIEWER" && (
                  <td className="px-5 py-5">
                    <div className="flex justify-end gap-4">
                      <AddVehicleModal editVehicle={vehicle}>
                        <button>
                          <Pencil className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                        </button>
                      </AddVehicleModal>

                      {user?.role === "ADMIN" && (
                        <button onClick={() => deleteVehicle(vehicle.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        View
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
