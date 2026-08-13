"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { apiFetch, isApiError } from "@/lib/fetcher";
import { socket } from "@/lib/socket";
import { acceptVehiclePacket, mergeVehicleUpdate } from "@/lib/vehicle-update";
import { useClientStore } from "@/store/client-store";
import TrackingMap from "@/components/tracking/tracking-map";
import VehicleDetails from "@/components/tracking/vehicle-details";
import VehicleList from "@/components/tracking/vehicle-list";
import CustomSelect from "@/components/ui/custom-select";
import { TrackingListSkeleton } from "@/components/ui/skeletons/tracking-list-skeleton";
import { MapSkeleton } from "@/components/ui/skeletons/map-skeleton";

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
  client?: { id: string; name: string };
}

export default function TrackingPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | "api" | "network">(null);
  const [centerTrigger, setCenterTrigger] = useState(0);

  // Fleet Owner (ADMIN) client filter — reuses the global navbar client selector.
  // ADMIN's /vehicles returns every client's vehicles; selecting a client narrows
  // the map + list. CLIENT already only receives its own vehicles, so this is a no-op.
  const { selectedClient } = useClientStore();

  // RC11–RC13: per-vehicle high-water timestamp so duplicate / out-of-order /
  // timestamp-invalid packets are ignored. A ref — never triggers a re-render.
  const lastTimestampsRef = useRef<Record<string, number>>({});

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/vehicles");

      // apiFetch now rejects on non-2xx, so a 500 lands in the catch below. Kept as a
      // defensive guard: it also covers a non-ok response reaching here another way.
      if (!response.ok) {
        setError("api");
        return;
      }

      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (err) {
      // An ApiError means the server answered with a 4xx/5xx; anything else means
      // fetch itself rejected and the server was unreachable. Keeping them apart
      // preserves the two distinct messages below.
      console.error(err);
      setError(isApiError(err) ? "api" : "network");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    // RC10: named handler so cleanup removes only THIS listener. `socket.off` with no
    // handler drops every other component's vehicleLocationUpdate listener too.
    const handleLocationUpdate = (
      updatedVehicle: Vehicle & { timestamp?: number },
    ) => {
      // RC11–RC13: drop duplicate / out-of-order / invalid-timestamp packets.
      if (
        !acceptVehiclePacket(
          lastTimestampsRef.current,
          updatedVehicle?.id,
          updatedVehicle?.timestamp,
        )
      ) {
        return;
      }

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === updatedVehicle.id
            ? mergeVehicleUpdate(vehicle, updatedVehicle)
            : vehicle,
        ),
      );

      setSelected((prev) => {
        if (prev && prev.id === updatedVehicle.id) {
          return mergeVehicleUpdate(prev, updatedVehicle);
        }

        return prev;
      });
    };

    socket.on("vehicleLocationUpdate", handleLocationUpdate);

    return () => {
      socket.off("vehicleLocationUpdate", handleLocationUpdate);
    };
  }, []);

  const handleCenterMap = () => {
    setCenterTrigger((prev) => prev + 1);
  };

  const visibleVehicles = useMemo(
    () =>
      selectedClient
        ? vehicles.filter((v) => v.client?.id === selectedClient.id)
        : vehicles,
    [vehicles, selectedClient],
  );

  const selectOptions = useMemo(() => {
    return [
      { value: "", label: "All Vehicles" },
      ...visibleVehicles.map((v) => ({
        value: v.id,
        label: v.vehicleNumber,
        sublabel: v.driverName,
        status: v.status,
      })),
    ];
  }, [visibleVehicles]);

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="hidden w-[280px] flex-shrink-0 border-r border-border md:block">
          <TrackingListSkeleton />
        </div>
        <div className="flex-1 p-3">
          <MapSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm font-medium text-foreground">
          {error === "network"
            ? "Can't reach the server. Check your connection."
            : "Something went wrong loading vehicles."}
        </p>
        <button
          onClick={fetchVehicles}
          className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-all cursor-pointer shadow-sm outline-none"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden bg-background">
      {/* MOBILE VIEW (< 768px / md) */}
      <div className="flex h-full flex-col md:hidden">
        {/* Search & Custom Dropdown Header */}
        <div className="border-b border-border bg-background p-3.5 z-30">
          <CustomSelect
            value={selected?.id || ""}
            onChange={(val) => {
              const vehicle = vehicles.find((item) => item.id === val) || null;
              setSelected(vehicle);
            }}
            options={selectOptions}
            placeholder="Select a vehicle..."
          />
        </div>

        {/* Map Area */}
        <div className="relative flex-1 overflow-hidden min-h-[300px]">
          <TrackingMap
            vehicles={visibleVehicles}
            selectedVehicle={selected}
            centerTrigger={centerTrigger}
            onVehicleSelect={(v) =>
              setSelected(vehicles.find((item) => item.id === v.id) ?? null)
            }
          />
        </div>

        {/* Mobile bottom sheet drawer details */}
        {selected && (
          <div className="absolute bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="w-full bg-card rounded-t-2xl border-t border-border shadow-lg">
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3" />
              <div className="max-h-[50vh] overflow-y-auto pb-8 px-4 no-scrollbar">
                <VehicleDetails
                  vehicle={selected}
                  onCenterMap={handleCenterMap}
                  onClose={() => setSelected(null)}
                  mobile
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TABLET VIEW (>= 768px and < 1280px / xl) */}
      <div className="hidden md:flex xl:hidden h-full">
        {/* Left Side Vehicle List */}
        <div className="w-[260px] flex-shrink-0 border-r border-border bg-card">
          <VehicleList
            vehicles={visibleVehicles}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Map with floating overlay details */}
        <div className="relative flex-1 overflow-hidden">
          <TrackingMap
            vehicles={visibleVehicles}
            selectedVehicle={selected}
            centerTrigger={centerTrigger}
            onVehicleSelect={(v) =>
              setSelected(vehicles.find((item) => item.id === v.id) ?? null)
            }
          />

          {/* Floating Tablet Vehicle Details */}
          {selected && (
            <div className="absolute right-4 bottom-4 top-4 w-[310px] z-50 animate-in fade-in-50 slide-in-from-right duration-300">
              <div className="h-full w-full bg-card rounded-lg border border-border shadow-md flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <VehicleDetails
                    vehicle={selected}
                    onCenterMap={handleCenterMap}
                    onClose={() => setSelected(null)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP VIEW (>= 1280px / xl) */}
      <div className="hidden xl:flex h-full">
        {/* Vehicle List */}
        <div className="w-[280px] flex-shrink-0 border-r border-border bg-card">
          <VehicleList
            vehicles={visibleVehicles}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Map */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <TrackingMap
            vehicles={visibleVehicles}
            selectedVehicle={selected}
            centerTrigger={centerTrigger}
            onVehicleSelect={(v) =>
              setSelected(vehicles.find((item) => item.id === v.id) ?? null)
            }
          />
        </div>

        {/* Details Panel Sidebar */}
        {selected && (
          <div className="w-[320px] flex-shrink-0 border-l border-border bg-card">
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
