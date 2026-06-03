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

export default function TrackingMap({
  vehicle,
  centerTrigger,
}: TrackingMapProps) {
  return (
    <div className="relative h-[calc(100vh-64px)] overflow-hidden">
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
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap
          latitude={vehicle.latitude || 11.2588}
          longitude={vehicle.longitude || 75.7804}
          centerTrigger={centerTrigger}
        />

        <Marker
          position={[vehicle.latitude || 11.2588, vehicle.longitude || 75.7804]}
        >
          <Popup>
            <div className="space-y-1">
              <h3 className="font-semibold">{vehicle.vehicleNumber}</h3>

              <p className="text-sm">Driver: {vehicle.driverName}</p>

              <p className="text-sm">Speed: {vehicle.speed} km/h</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      {/* Map Controls UI */}
      <div className="absolute bottom-5 right-5 z-[1000] flex flex-col gap-2.5">
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-colors hover:bg-muted dark:bg-[#1f2937] dark:hover:bg-[#374151]">
          <Plus className="h-4 w-4" />
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-colors hover:bg-muted dark:bg-[#1f2937] dark:hover:bg-[#374151]">
          <Minus className="h-4 w-4" />
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-colors hover:bg-muted dark:bg-[#1f2937] dark:hover:bg-[#374151]">
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
