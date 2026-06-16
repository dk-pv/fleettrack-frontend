"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/fetcher";
import TrackingMap from "@/components/tracking/tracking-map";
import VehicleDetails from "@/components/tracking/vehicle-details";
import { socket } from "@/lib/socket";

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
  const [centerTrigger, setCenterTrigger] = useState(0);
  const handleCenterMap = () => {
    setCenterTrigger((prev) => prev + 1);
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

  useEffect(() => {
    socket.on("vehicleLocationUpdate", (data) => {
      setVehicle((prev) => {
        if (!prev) {
          return prev;
        }
        if (data.id !== prev.id) {
          return prev;
        }
        return {
          ...prev,
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          status: data.status,
          ignition: data.ignition,
          batteryVoltage: data.batteryVoltage,
          charge: data.charge,
          updatedAt: data.updatedAt,
        };
      });
    });

    return () => {
      socket.off("vehicleLocationUpdate");
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        Loading tracking...
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
