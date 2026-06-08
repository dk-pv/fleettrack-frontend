"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import { socket } from "@/lib/socket";

import TrackingMap from "@/components/tracking/tracking-map";
import VehicleDetails from "@/components/tracking/vehicle-details";
import VehicleList from "@/components/tracking/vehicle-list";

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

export default function TrackingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  const [loading, setLoading] = useState(true);

  const [centerTrigger, setCenterTrigger] = useState(0);

  const fetchVehicles = async () => {
    try {
      const response = await apiFetch("/vehicles");

      const data = await response.json();

      setVehicles(data.vehicles || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    socket.on("vehicleLocationUpdate", (updatedVehicle) => {
      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle,
        ),
      );

      setSelected((prev) => {
        if (prev && prev.id === updatedVehicle.id) {
          return updatedVehicle;
        }

        return prev;
      });
    });

    return () => {
      socket.off("vehicleLocationUpdate");
    };
  }, []);

  const handleCenterMap = () => {
    setCenterTrigger((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        Loading tracking...
      </div>
    );
  }

  return (
    <div
      className={`grid h-[calc(100vh-64px)] overflow-hidden transition-all duration-300 ${
        selected ? "grid-cols-[300px_1fr_320px]" : "grid-cols-[300px_1fr]"
      }`}
    >
      <VehicleList
        vehicles={vehicles}
        selected={selected}
        onSelect={setSelected}
      />

      <TrackingMap
        vehicles={vehicles}
        selectedVehicle={selected}
        centerTrigger={centerTrigger}
      />

      {selected && (
        <VehicleDetails
          vehicle={selected}
          onCenterMap={handleCenterMap}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
