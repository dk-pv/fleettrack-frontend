"use client";

import { Car, MapPin, User, Cpu, Activity, ArrowLeft } from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";
import VehicleStatusBadge from "@/components/vehicles/vehicle-status-badge";

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

  createdAt: string;
}

export default function VehicleDetailPage() {
  const params = useParams();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchVehicle = async () => {
    try {
      const response = await apiFetch(`/vehicles/${params.id}`);

      const data = await response.json();

      setVehicle(data.vehicle);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, []);

  if (loading) {
    return <div className="p-6">Loading vehicle...</div>;
  }

  if (!vehicle) {
    return <div className="p-6">Vehicle not found</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Back */}
      <Link
        href="/vehicles"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vehicles
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {vehicle.vehicleName}
          </h1>

          <p className="mt-2 text-muted-foreground">
            Vehicle Number: {vehicle.vehicleNumber}
          </p>
        </div>

        <VehicleStatusBadge status={vehicle.status} />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {/* Driver */}
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />

            <h3 className="font-semibold">Driver</h3>
          </div>

          <p className="mt-4 text-2xl font-bold">{vehicle.driverName}</p>
        </div>

        {/* GPS */}
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-green-600" />

            <h3 className="font-semibold">GPS Device</h3>
          </div>

          <p className="mt-4 text-2xl font-bold">{vehicle.gpsDeviceId}</p>
        </div>

        {/* Client */}
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center gap-3">
            <Car className="h-5 w-5 text-yellow-600" />

            <h3 className="font-semibold">Client</h3>
          </div>

          <p className="mt-4 text-2xl font-bold">{vehicle.clientName}</p>
        </div>
      </div>

      {/* Location + Stats */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Location */}
        <div className="rounded-xl border border-border bg-background p-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-red-500" />

            <h3 className="text-lg font-semibold">Current Location</h3>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Latitude</p>

              <h4 className="mt-1 text-xl font-semibold">{vehicle.latitude}</h4>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Longitude</p>

              <h4 className="mt-1 text-xl font-semibold">
                {vehicle.longitude}
              </h4>
            </div>
          </div>
        </div>

        {/* Speed */}
        <div className="rounded-xl border border-border bg-background p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-green-600" />

            <h3 className="text-lg font-semibold">Live Statistics</h3>
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground">Current Speed</p>

            <h2 className="mt-2 text-5xl font-bold">
              {vehicle.speed}
              <span className="ml-2 text-xl">km/h</span>
            </h2>
          </div>

          <div className="mt-8 flex gap-3">
            <button className="rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-black">
              Track Live
            </button>

            <button className="rounded-lg border border-border px-5 py-3 text-sm font-medium">
              Trip History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
