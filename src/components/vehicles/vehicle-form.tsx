"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleNumber: string;
  gpsDeviceId: string;
  driverName: string;
  clientName: string;
  status: string;
}

interface VehicleFormProps {
  buttonText?: string;
  editVehicle?: Vehicle | null;
}

export default function VehicleForm({
  buttonText = "Add Vehicle",
  editVehicle,
}: VehicleFormProps) {
  const isEdit = !!editVehicle;

  const [vehicleName, setVehicleName] = useState(
    editVehicle?.vehicleName || "",
  );

  const [vehicleNumber, setVehicleNumber] = useState(
    editVehicle?.vehicleNumber || "",
  );

  const [driverName, setDriverName] = useState(editVehicle?.driverName || "");

  const [gpsDeviceId, setGpsDeviceId] = useState(
    editVehicle?.gpsDeviceId || "",
  );

  const [clientName, setClientName] = useState(editVehicle?.clientName || "");

  const [status, setStatus] = useState(editVehicle?.status || "IDLE");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await apiFetch(
        isEdit ? `/vehicles/${editVehicle.id}` : "/vehicles",
        {
          method: isEdit ? "PATCH" : "POST",

          body: JSON.stringify({
            vehicleName,
            vehicleNumber,
            gpsDeviceId,
            driverName,
            clientName,
            status,
            latitude: 0,
            longitude: 0,
            speed: 0,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        toast.success(isEdit ? "Vehicle updated" : "Vehicle added");

        window.location.reload();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);

      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Vehicle Name */}
      <div>
        <label className="mb-2 block text-sm font-medium">Vehicle Name</label>

        <input
          type="text"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          placeholder="Enter vehicle name"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Vehicle Number */}
      <div>
        <label className="mb-2 block text-sm font-medium">Vehicle Number</label>

        <input
          type="text"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          placeholder="Enter vehicle number"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Driver */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Assigned Driver
        </label>

        <input
          type="text"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          placeholder="Enter driver name"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Client */}
      <div>
        <label className="mb-2 block text-sm font-medium">Client Name</label>

        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Enter client name"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* GPS */}
      <div>
        <label className="mb-2 block text-sm font-medium">GPS Device ID</label>

        <input
          type="text"
          value={gpsDeviceId}
          onChange={(e) => setGpsDeviceId(e.target.value)}
          placeholder="Enter GPS device ID"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-2 block text-sm font-medium">Status</label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        >
          <option value="MOVING">Moving</option>

          <option value="IDLE">Idle</option>

          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="h-11 rounded-lg bg-[#0f172a] px-5 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        {loading ? "Loading..." : buttonText}
      </button>
    </form>
  );
}
