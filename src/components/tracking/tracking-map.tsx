"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.marker.slideto";

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { LocateFixed, Minus, Plus } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const vehicleIcon = new L.Icon({
  iconUrl: "/cargo-truck.png",
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -40],
});

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

interface TrackingMapProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  centerTrigger: number;
}

const DEFAULT_LOCATION: [number, number] = [11.2588, 75.7804];

function RecenterMap({
  latitude,
  longitude,
  centerTrigger,
}: {
  latitude: number;
  longitude: number;
  centerTrigger: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 15, {
      animate: true,
    });
  }, [latitude, longitude, centerTrigger, map]);

  return null;
}

function FitAllVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  const map = useMap();
  useEffect(() => {
    if (vehicles.length === 0) return;

    const bounds = L.latLngBounds(
      vehicles.map((vehicle) => [vehicle.latitude, vehicle.longitude]),
    );

    map.fitBounds(bounds, {
      padding: [100, 100],
      animate: true,
    });
  }, [vehicles, map]);
  return null;
}

function MapControls({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();
  return (
    <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2 md:bottom-5 md:right-5">
      <button
        onClick={() => map.zoomIn()}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md hover:bg-muted dark:bg-[#1f2937]"
      >
        <Plus className="h-4 w-4" />
      </button>

      <button
        onClick={() => map.zoomOut()}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md hover:bg-muted dark:bg-[#1f2937]"
      >
        <Minus className="h-4 w-4" />
      </button>

      <button
        onClick={() => {
          map.setView([latitude, longitude], 15, {
            animate: true,
          });
        }}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md hover:bg-muted dark:bg-[#1f2937]"
      >
        <LocateFixed className="h-4 w-4" />
      </button>
    </div>
  );
}

function LiveStatusCard({ vehicles }: { vehicles: Vehicle[] }) {
  const movingVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "MOVING",
  ).length;

  return (
    <div className="absolute bottom-3 left-3 z-10 rounded-2xl bg-white px-4 py-3 shadow-lg dark:bg-[#1f2937] md:bottom-5 md:left-5">
      <div className="flex gap-7">
        <div>
          <p className="text-2xl font-bold text-green-500">{movingVehicles}</p>

          <p className="mt-0.5 text-xs text-muted-foreground">Active</p>
        </div>

        <div className="w-px bg-border" />

        <div>
          <p className="text-2xl font-bold text-blue-500">{vehicles.length}</p>

          <p className="mt-0.5 text-xs text-muted-foreground">Vehicles</p>
        </div>
      </div>
    </div>
  );
}

function VehiclePopup({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="min-w-[220px] space-y-3">
      <div className="border-b pb-2">
        <h3 className="text-base font-semibold">{vehicle.vehicleNumber}</h3>

        <p className="text-xs text-muted-foreground">{vehicle.driverName}</p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>

          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              vehicle.status === "MOVING"
                ? "bg-green-100 text-green-700"
                : vehicle.status === "IDLE"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {vehicle.status}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Speed</span>

          <span className="font-medium">
            {Number(vehicle.speed).toFixed(1)} km/h
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Driver</span>

          <span className="font-medium">{vehicle.driverName}</span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- */
/* MAIN */
/* ----------------------------- */

export default function TrackingMap({
  vehicles,
  selectedVehicle,
  centerTrigger,
}: TrackingMapProps) {
  const [vehicleTrails, setVehicleTrails] = useState<
    Record<string, [number, number][]>
  >({});
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const validVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) => vehicle.latitude !== null && vehicle.longitude !== null,
      ),

    [vehicles],
  );

  /* ----------------------------- */
  /* FETCH HISTORY */
  /* ----------------------------- */

  useEffect(() => {
    const fetchVehicleHistory = async () => {
      try {
        if (!selectedVehicle) return;

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vehicles/${selectedVehicle.id}/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!data.success) return;

        const positions = data.history.map(
          (item: any) => [item.latitude, item.longitude] as [number, number],
        );

        setVehicleTrails((prev) => ({
          ...prev,

          [selectedVehicle.id]: positions,
        }));
      } catch (error) {
        console.log(error);
      }
    };

    fetchVehicleHistory();
  }, [selectedVehicle]);

  /* ----------------------------- */
  /* LIVE UPDATE */
  /* ----------------------------- */

  useEffect(() => {
    setVehicleTrails((prev) => {
      const updated = {
        ...prev,
      };

      vehicles.forEach((vehicle) => {
        const point: [number, number] = [vehicle.latitude, vehicle.longitude];

        if (!updated[vehicle.id]) {
          updated[vehicle.id] = [point];

          return;
        }

        const lastPoint = updated[vehicle.id][updated[vehicle.id].length - 1];

        const isSameLocation =
          lastPoint && lastPoint[0] === point[0] && lastPoint[1] === point[1];

        if (!isSameLocation) {
          updated[vehicle.id] = [...updated[vehicle.id], point].slice(-20);
        }
      });

      return updated;
    });
  }, [vehicles]);

  /* ----------------------------- */
  /* MARKER SLIDE */
  /* ----------------------------- */

  useEffect(() => {
    validVehicles.forEach((vehicle) => {
      const marker = markerRefs.current[vehicle.id];

      if (!marker) return;

      (marker as any).slideTo([vehicle.latitude, vehicle.longitude], {
        duration: 2000,

        keepAtCenter: false,
      });
    });
  }, [validVehicles]);

  return (
<div className="relative h-full min-h-[350px] w-full overflow-hidden">      {/* LIVE BADGE */}

      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-md dark:bg-[#1f2937]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

        <span className="text-sm font-medium">Live Tracking</span>
      </div>

      {/* STATUS CARD */}
      <LiveStatusCard vehicles={vehicles} />

      {/* MAP */}
      <MapContainer
        center={DEFAULT_LOCATION}
        zoom={8}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" , zIndex: 1,}}
        zoomControl={false}
        preferCanvas={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
        />

        {!selectedVehicle && <FitAllVehicles vehicles={validVehicles} />}

        {selectedVehicle && (
          <RecenterMap
            latitude={selectedVehicle.latitude}
            longitude={selectedVehicle.longitude}
            centerTrigger={centerTrigger}
          />
        )}

        {/* ROUTE LINE */}

        {validVehicles.map((vehicle) => {
          const trail = vehicleTrails[vehicle.id];

          if (!trail || trail.length < 2) return null;

          if (selectedVehicle && selectedVehicle.id !== vehicle.id) {
            return null;
          }

          return (
            <Polyline
              key={`trail-${vehicle.id}`}
              positions={trail}
              pathOptions={{
                color: "#2563eb",

                weight: 5,

                opacity: 0.9,
              }}
            />
          );
        })}

        {/* VEHICLE MARKERS */}
        {validVehicles.map((vehicle) => {
          return (
            <Marker
              key={vehicle.id}
              ref={(ref) => {
                if (ref) {
                  markerRefs.current[vehicle.id] = ref;
                }
              }}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={vehicleIcon}
              riseOnHover
            >
              <Popup>
                <VehiclePopup vehicle={vehicle} />
              </Popup>
            </Marker>
          );
        })}

        {/* MAP CONTROLS */}

        <MapControls
          latitude={selectedVehicle?.latitude || DEFAULT_LOCATION[0]}
          longitude={selectedVehicle?.longitude || DEFAULT_LOCATION[1]}
        />
      </MapContainer>
    </div>
  );
}
