"use client";

import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Minus, Plus, LocateFixed } from "lucide-react";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const vehicleIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
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
  vehicle: Vehicle;
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
    map.setView([latitude, longitude], 13, {
      animate: true,
    });
  }, [latitude, longitude, centerTrigger, map]);

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
    <div className="absolute bottom-5 right-5 z-[1000] flex flex-col gap-2.5">
      <button
        onClick={() => map.zoomIn()}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-colors hover:bg-muted dark:bg-[#1f2937] dark:hover:bg-[#374151]"
      >
        <Plus className="h-4 w-4" />
      </button>

      <button
        onClick={() => map.zoomOut()}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-colors hover:bg-muted dark:bg-[#1f2937] dark:hover:bg-[#374151]"
      >
        <Minus className="h-4 w-4" />
      </button>

      <button
        onClick={() => {
          map.setView([latitude, longitude], 15, {
            animate: true,
          });
        }}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-colors hover:bg-muted dark:bg-[#1f2937] dark:hover:bg-[#374151]"
      >
        <LocateFixed className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function TrackingMap({
  vehicle,
  centerTrigger,
}: TrackingMapProps) {
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Live Tracking Badge */}
      <div className="absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-md dark:bg-[#1f2937]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

        <span className="text-sm font-medium">Live Tracking</span>
      </div>
      {/* Bottom Stats */}
      <div className="absolute bottom-5 left-5 z-[1000] rounded-2xl bg-white px-5 py-4 shadow-lg dark:bg-[#1f2937]">
        <div className="flex gap-7">
          <div>
            <p className="text-2xl font-bold text-green-500">
              {vehicle.status === "MOVING" ? 1 : 0}
            </p>

            <p className="mt-0.5 text-xs text-muted-foreground">Active</p>
          </div>

          <div className="w-px bg-border" />

          <div>
            <p className="text-2xl font-bold text-blue-500">{vehicle.speed}</p>

            <p className="mt-0.5 text-xs text-muted-foreground">km/h</p>
          </div>
        </div>
      </div>
      {/* Map */}

      <MapContainer
        center={
          vehicle.latitude && vehicle.longitude
            ? [vehicle.latitude, vehicle.longitude]
            : DEFAULT_LOCATION
        }
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false}
        preferCanvas={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap
          latitude={vehicle.latitude || DEFAULT_LOCATION[0]}
          longitude={vehicle.longitude || DEFAULT_LOCATION[1]}
          centerTrigger={centerTrigger}
        />

        <Marker
          position={[
            vehicle.latitude || DEFAULT_LOCATION[0],
            vehicle.longitude || DEFAULT_LOCATION[1],
          ]}
          icon={vehicleIcon}
          riseOnHover={true}
        >
          <Popup>
            <div className="min-w-[220px] space-y-3">
              <div className="border-b pb-2">
                <h3 className="text-base font-semibold">
                  {vehicle.vehicleNumber}
                </h3>

                <p className="text-xs text-muted-foreground">
                  {vehicle.vehicleName}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Driver</span>

                  <span className="font-medium">{vehicle.driverName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Speed</span>

                  <span className="font-medium">{vehicle.speed} km/h</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      vehicle.status === "MOVING"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
        <MapControls
          latitude={vehicle.latitude || DEFAULT_LOCATION[0]}
          longitude={vehicle.longitude || DEFAULT_LOCATION[1]}
        />
      </MapContainer>
      {/* Map Controls UI */}
    </div>
  );
}
