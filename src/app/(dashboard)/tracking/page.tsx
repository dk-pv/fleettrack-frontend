// "use client";

// import { useState } from "react";

// import { vehicles } from "@/data/tracking-data";
// import type { Vehicle } from "@/data/tracking-data";

// import TrackingMap from "@/components/tracking/tracking-map";
// import VehicleDetails from "@/components/tracking/vehicle-details";
// import VehicleList from "@/components/tracking/vehicle-list";

// export default function TrackingPage() {
//   const [selected, setSelected] = useState<Vehicle>(vehicles[0]);

//   return (
//     <div className="grid h-[calc(100vh-64px)] grid-cols-[280px_1fr_300px] overflow-hidden">
//       <VehicleList selected={selected} onSelect={setSelected} />
//       <TrackingMap />
//       <VehicleDetails vehicle={selected} />
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/fetcher";

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

  const fetchVehicles = async () => {
    try {
      const response = await apiFetch("/vehicles");

      const data = await response.json();

      setVehicles(data.vehicles);

      if (data.vehicles.length > 0) {
        setSelected(data.vehicles[0]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        Loading tracking...
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        No vehicles found
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-64px)] grid-cols-[280px_1fr_320px] overflow-hidden">
      <VehicleList
        vehicles={vehicles}
        selected={selected}
        onSelect={setSelected}
      />

      <TrackingMap vehicle={selected} />

      <VehicleDetails vehicle={selected} />
    </div>
  );
}