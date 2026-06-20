"use client";

import {
  Car,
  MapPin,
  User,
  Cpu,
  Activity,
  ArrowLeft,
  Radio,
  Route as RouteIcon,
  Wifi,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";
import VehicleStatusBadge from "@/components/vehicles/vehicle-status-badge";
import { useAuthStore } from "@/store/auth-store";
import dynamic from "next/dynamic";
const VehicleMap = dynamic(() => import("@/components/vehicles/vehicle-map"), {
  ssr: false,
});

interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleNumber: string;
  gpsDeviceId: string;
  driverName: string;
  status: string;
  latitude: number;
  longitude: number;
  speed: number;
  createdAt: string;
  updatedAt: string;

  client?: {
    id: string;
    name: string;
  };
}
export default function VehicleDetailPage() {
  const params = useParams();
  const { user } = useAuthStore();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  const downloadReport = async () => {
    if (!vehicle) return;

    try {
      setDownloading(true);

      const response = await apiFetch(`/vehicles/${vehicle.id}/report`);

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${vehicle.vehicleNumber}-${
        new Date().toISOString().split("T")[0]
      }-report.pdf`;
      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);

      alert("Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

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
    if (params.id) {
      fetchVehicle();
    }
  }, [params.id]);

  if (loading) {
    return <div className="p-6">Loading vehicle...</div>;
  }

  if (!vehicle) {
    return <div className="p-6">Vehicle not found</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Back */}
      <Link
        href="/vehicles"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vehicles
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {" "}
            {vehicle.vehicleName}
          </h1>

          <p className="mt-2 text-muted-foreground">
            Vehicle Number: {vehicle.vehicleNumber}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Last Updated: {new Date(vehicle.updatedAt).toLocaleString()}
          </p>
        </div>

        <div className="w-fit">
          <VehicleStatusBadge status={vehicle.status} />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Driver */}
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />

            <h3 className="font-semibold">Driver</h3>
          </div>

          <p className="mt-4 break-all text-xl font-bold md:text-2xl">
            {vehicle.driverName}
          </p>
        </div>

        {/* GPS */}
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-green-600" />

            <h3 className="font-semibold">GPS Device</h3>
          </div>

          <p className="mt-4 break-all text-2xl font-bold">
            {vehicle.gpsDeviceId}
          </p>
        </div>

        {/* Client */}
        {user?.role === "ADMIN" && (
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-yellow-600" />
              <h3 className="font-semibold">Client</h3>
            </div>

            <p className="mt-4 break-all text-2xl font-bold">
              {vehicle.client?.name || "N/A"}
            </p>
          </div>
        )}
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Active Vehicles */}
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center gap-3">
            <Radio className="h-5 w-5 text-green-600" />

            <h3 className="text-sm font-medium text-muted-foreground">
              Active Now
            </h3>
          </div>

          <h2 className="mt-4 text-3xl font-bold">12</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Vehicles currently active
          </p>
        </div>

        {/* Total Distance */}
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center gap-3">
            <RouteIcon className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Distance
            </h3>
          </div>

          <h2 className="mt-4 text-3xl font-bold">245 km</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Distance travelled today
          </p>
        </div>

        {/* Live Updates */}
        <div className="rounded-xl border border-border bg-background p-5">
          <div className="flex items-center gap-3">
            <Wifi className="h-5 w-5 text-yellow-600" />

            <h3 className="text-sm font-medium text-muted-foreground">
              Live Updates
            </h3>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />

            <h2 className="text-2xl font-bold">Connected</h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            GPS updates active
          </p>
        </div>
      </div>

      {/* Location + Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Location */}

        <div className="rounded-xl border border-border bg-background p-4 md:p-6">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-red-500" />

            <h3 className="text-lg font-semibold">Live Vehicle Location</h3>
          </div>

          <div className="mt-6">
            {vehicle.latitude !== 0 && vehicle.longitude !== 0 ? (
              <div className="h-[320px] md:h-[420px]">
                <VehicleMap
                  latitude={vehicle.latitude}
                  longitude={vehicle.longitude}
                  vehicleName={vehicle.vehicleName}
                />
              </div>
            ) : (
              <div className="flex h-[320px] flex-col md:h-[420px] items-center justify-center rounded-xl border border-dashed border-border text-center">
                <MapPin className="h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  Live location unavailable
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Waiting for GPS updates
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Latitude</p>

              <h4 className="mt-1 text-sm font-semibold">{vehicle.latitude}</h4>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Longitude</p>

              <h4 className="mt-1 text-sm font-semibold">
                {vehicle.longitude}
              </h4>
            </div>
          </div>
        </div>
        {/* Speed */}
        <div className="rounded-xl border border-border bg-background p-4 md:p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-green-600" />

            <h3 className="text-lg font-semibold">Live Statistics</h3>
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground">Current Speed</p>

            <h2 className="mt-2 text-4xl font-bold md:text-5xl">
              {vehicle.speed}
              <span className="ml-2 text-xl">km/h</span>
            </h2>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={`/tracking/${vehicle.id}`}
              className="flex h-11 w-full items-center justify-center sm:w-auto rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Track Live
            </Link>

            <Link
              href={`/vehicles/${vehicle.id}/trips`}
              className="flex h-11 w-full items-center justify-center sm:w-auto rounded-lg border border-border px-5 py-3 text-sm font-medium"
            >
              Trip History
            </Link>

            <button
              onClick={downloadReport}
              disabled={downloading}
              className="flex h-11 w-full items-center gap-2 justify-center sm:w-auto rounded-lg border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />

              {downloading ? "Generating..." : "Generate PDF"}
            </button>
          </div>
        </div>

        {/* Trip Summary */}
        <div className="rounded-xl border border-border bg-background p-4 md:p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-600" />

            <h3 className="text-lg font-semibold">Current Trip Summary</h3>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <p className="text-sm text-muted-foreground">
                Distance Travelled
              </p>

              <h4 className="mt-1 text-2xl font-bold">245 km</h4>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Running Time</p>

              <h4 className="mt-1 text-2xl font-bold">5h 22m</h4>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Idle Time</p>

              <h4 className="mt-1 text-2xl font-bold">1h 10m</h4>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Trip Started</p>

              <h4 className="mt-1 text-lg font-semibold">
                29 May 2026 • 08:30 AM
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
