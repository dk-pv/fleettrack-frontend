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

        return {
          ...prev,

          latitude: data.latitude,

          longitude: data.longitude,

          speed: data.speed,

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
    <div className="grid h-[calc(100vh-64px)] grid-cols-[1fr_320px] overflow-hidden">
      <TrackingMap vehicle={vehicle} centerTrigger={centerTrigger} />

      <VehicleDetails vehicle={vehicle} onCenterMap={handleCenterMap} />
    </div>
  );
}
