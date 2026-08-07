"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";
import TrackingMap from "@/components/tracking/tracking-map";
import VehicleDetails from "@/components/tracking/vehicle-details";
import { socket } from "@/lib/socket";
import { acceptVehiclePacket, mergeVehicleUpdate } from "@/lib/vehicle-update";

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
  ignition?: boolean;
  batteryVoltage?: number;
  charge?: boolean;
}

export default function SingleTrackingPage() {
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | "api" | "network">(null);
  const [centerTrigger, setCenterTrigger] = useState(0);

  // RC11–RC13: per-vehicle high-water timestamp (ref) to drop duplicate /
  // out-of-order / timestamp-invalid packets.
  const lastTimestampsRef = useRef<Record<string, number>>({});

  const handleCenterMap = () => {
    setCenterTrigger((prev) => prev + 1);
  };

  const fetchVehicle = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/vehicles/${params.id}`);

      // apiFetch resolves for HTTP errors too — distinguish a real API failure from
      // a genuine "not found" so we never show "Vehicle not found" on a 500.
      if (!response.ok) {
        setError("api");
        return;
      }

      const data = await response.json();
      setVehicle(data.vehicle ?? null);
    } catch (err) {
      // fetch itself rejected → the server was unreachable.
      console.log(err);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchVehicle();
    }
  }, [params.id]);

  useEffect(() => {
    // RC10: named handler so cleanup removes only THIS listener, not every other
    // component's vehicleLocationUpdate subscription.
    const handleLocationUpdate = (data: Vehicle & { timestamp?: number }) => {
      // RC11–RC13: drop duplicate / out-of-order / invalid-timestamp packets.
      if (
        !acceptVehiclePacket(lastTimestampsRef.current, data?.id, data?.timestamp)
      ) {
        return;
      }

      setVehicle((prev) => {
        if (!prev) {
          return prev;
        }
        if (data.id !== prev.id) {
          return prev;
        }
        return mergeVehicleUpdate(prev, data);
      });
    };

    socket.on("vehicleLocationUpdate", handleLocationUpdate);

    return () => {
      socket.off("vehicleLocationUpdate", handleLocationUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        Loading tracking...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-medium text-foreground">
          {error === "network"
            ? "Can't reach the server. Check your connection."
            : "Something went wrong loading this vehicle."}
        </p>
        <button
          onClick={fetchVehicle}
          className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-all cursor-pointer shadow-sm outline-none"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        Vehicle not found
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* MOBILE VIEW (< 768px / md) */}
      <div className="flex h-full flex-col md:hidden">
        {/* Map Area */}
        <div className="relative flex-1 overflow-hidden min-h-[300px]">
          <TrackingMap
            vehicles={[vehicle]}
            selectedVehicle={vehicle}
            centerTrigger={centerTrigger}
          />
        </div>

        {/* Mobile bottom sheet drawer details */}
        <div className="absolute bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="w-full bg-card/95 backdrop-blur-md rounded-t-3xl border-t border-border shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3" />
            <div className="max-h-[50vh] overflow-y-auto pb-8 px-4 no-scrollbar">
              <VehicleDetails
                vehicle={vehicle}
                onCenterMap={handleCenterMap}
                onClose={() => {}}
                mobile
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABLET & DESKTOP VIEW (>= 768px / md) */}
      <div className="hidden md:grid h-full grid-cols-[1fr_340px]">
        {/* Map */}
        <div className="min-w-0 h-full overflow-hidden">
          <TrackingMap
            vehicles={[vehicle]}
            selectedVehicle={vehicle}
            centerTrigger={centerTrigger}
          />
        </div>

        {/* Details Panel Sidebar */}
        <div className="overflow-y-auto border-l border-border bg-card">
          <VehicleDetails
            vehicle={vehicle}
            onCenterMap={handleCenterMap}
            onClose={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
