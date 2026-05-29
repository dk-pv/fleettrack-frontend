"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

interface VehicleMapProps {
  latitude: number;

  longitude: number;

  vehicleName: string;
}

export default function VehicleMap({
  latitude,
  longitude,
  vehicleName,
}: VehicleMapProps) {
  return (
    <div className="overflow-hidden rounded-xl">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-[420px] w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[latitude, longitude]}>
          <Popup>{vehicleName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
