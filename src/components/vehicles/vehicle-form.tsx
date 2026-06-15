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
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Vehicle Name */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle Name</label>

        <input
          type="text"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
          placeholder="Enter vehicle name"
          required
          className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Vehicle Number */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle Number</label>

        <input
          type="text"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          placeholder="Enter vehicle number"
          required
          className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Driver */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Assigned Driver
        </label>

        <input
          type="text"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          placeholder="Enter driver name"
          required
          className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Client */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">Client Name</label>

        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Enter client name"
          required
          className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* GPS */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">GPS Device ID</label>

        <input
          type="text"
          value={gpsDeviceId}
          onChange={(e) => setGpsDeviceId(e.target.value)}
          placeholder="Enter GPS device ID"
          required
          className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="MOVING">Moving</option>

          <option value="IDLE">Idle</option>

          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      {/* Submit */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="h-10 w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 px-5 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Saving..." : buttonText}
        </button>
      </div>
    </form>
  );
}
