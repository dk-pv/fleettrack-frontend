"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { apiFetch, isApiError } from "@/lib/fetcher";
import { socket } from "@/lib/socket";
import { acceptVehiclePacket, mergeVehicleUpdate } from "@/lib/vehicle-update";
import { useClientStore } from "@/store/client-store";
import TrackingMap from "@/components/tracking/tracking-map";
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

  // One layout for every breakpoint: the vehicle picker (a dropdown on mobile, the list
  // sidebar from md up) and then the map, which takes everything left over. The three
  // per-breakpoint blocks this replaced each mounted their own <TrackingMap>, so three
  // Google Maps instances and three sets of markers were live at once with two hidden.
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background md:flex-row">
      {/* MOBILE VEHICLE PICKER (< md) — the sidebar is too wide for a phone */}
      <div className="z-30 border-b border-border bg-background p-3.5 md:hidden">
        <CustomSelect
          value={selected?.id || ""}
          onChange={(val) => {
            setSelected(vehicles.find((item) => item.id === val) || null);
          }}
          options={selectOptions}
          placeholder="Select a vehicle..."
        />
      </div>

      {/* VEHICLE LIST (md and up) */}
      <div className="hidden w-[260px] flex-shrink-0 bg-card md:block xl:w-[280px]">
        <VehicleList
          vehicles={visibleVehicles}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      {/* MAP — fills all remaining space; the selected vehicle's details now ride on the
          map as a compact popup instead of a side panel. min-w-0 lets this flex child
          shrink below its content width instead of pushing the sidebar off-screen. */}
      <div className="relative min-h-[300px] min-w-0 flex-1 overflow-hidden">
        <TrackingMap
          vehicles={visibleVehicles}
          selectedVehicle={selected}
          onVehicleSelect={(v) =>
            setSelected(v ? (vehicles.find((item) => item.id === v.id) ?? null) : null)
          }
          showVehicleCard
        />
      </div>
    </div>
  );
}
