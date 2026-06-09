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
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      {/* MOBILE */}

      <div className="flex h-full flex-col lg:hidden">
        {/* Dropdown */}

        <div className="border-b border-border bg-background p-3">
          <select
            value={selected?.id || ""}
            onChange={(e) => {
              const vehicle =
                vehicles.find((item) => item.id === e.target.value) || null;

              setSelected(vehicle);
            }}
            className="
              h-11
              w-full
              rounded-xl
              border
              border-border
              bg-background
              px-4
              text-sm
              font-medium
              outline-none
            "
          >
            <option value="">All Vehicles</option>

            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.vehicleNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Map */}

       <div className=" min-h-[300px] flex-1 overflow-hidden " >
          <TrackingMap
            vehicles={vehicles}
            selectedVehicle={selected}
            centerTrigger={centerTrigger}
          />
        </div>

        {/* Details */}

        {selected && (
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-border bg-background">
            <VehicleDetails
              vehicle={selected}
              onCenterMap={handleCenterMap}
              onClose={() => setSelected(null)}
              mobile
            />
          </div>
        )}
      </div>

      {/* TABLET + DESKTOP */}

      <div className="hidden h-full lg:flex">
        {/* Vehicle List */}

        <div className="w-[250px] flex-shrink-0 border-r border-border">
          <VehicleList
            vehicles={vehicles}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Map */}

        <div className="min-w-0 flex-1 overflow-hidden">
          <TrackingMap
            vehicles={vehicles}
            selectedVehicle={selected}
            centerTrigger={centerTrigger}
          />
        </div>

        {/* Details */}

        {selected && (
          <div className="w-[300px] flex-shrink-0 border-l border-border">
            <VehicleDetails
              vehicle={selected}
              onCenterMap={handleCenterMap}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
