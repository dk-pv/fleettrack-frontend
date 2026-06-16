"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { LocateFixed, Minus, Navigation2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculateBearing,
  haversineDistance,
  isValidCoordinate,
} from "@/lib/gps-utils";

/* -------------------------------------------------- */
/* TYPES                                              */
/* -------------------------------------------------- */

export interface Vehicle {
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
  timestamp?: number;
  ignition?: boolean;
  batteryVoltage?: number;
}

interface TrackingMapProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  centerTrigger: number;
  followMode?: boolean;
}

/* -------------------------------------------------- */
/* CONSTANTS                                          */
/* -------------------------------------------------- */

const DEFAULT_LOCATION = { lat: 11.2588, lng: 75.7804 };
const DEFAULT_ZOOM = 8;


const MAP_CONTAINER_STYLE: React.CSSProperties = {
  height: "100%",
  width: "100%",
};

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  gestureHandling: "greedy",
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: false,
  clickableIcons: false,
  mapId: "DEMO_MAP_ID",
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
  ],
};

/* -------------------------------------------------- */
/* INJECT PULSE KEYFRAMES                             */
/* -------------------------------------------------- */

if (typeof window !== "undefined") {
  const styleId = "ft-pulse-ring-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes pulse-ring {
        0%   { transform: scale(1);   opacity: 0.8; }
        80%  { transform: scale(1.8); opacity: 0;   }
        100% { transform: scale(1.8); opacity: 0;   }
      }
    `;
    document.head.appendChild(style);
  }
}

/* -------------------------------------------------- */
/* VEHICLE ICON (DivIcon → google.maps.Icon)          */
/* -------------------------------------------------- */

function createVehicleIconUrl(
  heading: number,
  status: string,
): google.maps.Icon {
  const isMoving = status === "MOVING";
  const color = isMoving
    ? "#10b981"
    : status === "IDLE"
      ? "#f59e0b"
      : "#ef4444";

  const pulse = isMoving
    ? `<span style="
        position:absolute;top:-6px;left:-6px;width:52px;height:52px;
        border-radius:50%;border:2px solid ${color};
        animation:pulse-ring 1.5s ease-out infinite;pointer-events:none;
      "></span>`
    : "";

  const svg = `
    <div style="
      position:relative;
      width:40px;height:40px;
      display:flex;align-items:center;justify-content:center;
      transform:rotate(${heading}deg);
      transition:transform 0.6s ease;
    ">
      ${pulse}
      <div style="
        width:36px;height:36px;border-radius:50%;
        background:white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 0 2px ${color};
        display:flex;align-items:center;justify-content:center;
        overflow:hidden;
      ">
        <img src="/cargo-truck.png" style="width:22px;height:22px;object-fit:contain;" />
      </div>
    </div>
  `;

  const encoded = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <foreignObject width="40" height="40">
        <div xmlns="http://www.w3.org/1999/xhtml">${svg}</div>
      </foreignObject>
    </svg>`,
  )}`;

  return {
    url: encoded,
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 20),
  };
}

/* -------------------------------------------------- */
/* VEHICLE MARKER                                     */
/* -------------------------------------------------- */

interface VehicleMarkerProps {
  map: google.maps.Map | null;
  vehicle: Vehicle;
  heading: number;
  isSelected: boolean;
  onClick: () => void;
}

function VehicleMarker({
  map,
  vehicle,
  heading,
  isSelected,
  onClick,
}: VehicleMarkerProps) {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null,
  );
  const elementRef = useRef<HTMLDivElement | null>(null);
  const prevPos = useRef<{ lat: number; lng: number }>({
    lat: vehicle.latitude,
    lng: vehicle.longitude,
  });

  // Smooth animated move toward new position
  const animateMarkerTo = useCallback(
    (
      marker: google.maps.marker.AdvancedMarkerElement,
      destination: { lat: number; lng: number },
    ) => {
      const start = marker.position;
      if (!start) return;

      const startLat =
        typeof start.lat === "function"
          ? (start as any).lat()
          : (start.lat ?? destination.lat);
      const startLng =
        typeof start.lng === "function"
          ? (start as any).lng()
          : (start.lng ?? destination.lng);
      const destLat = destination.lat;
      const destLng = destination.lng;

      const duration = 1500;
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic

        const lat = startLat + (destLat - startLat) * ease;
        const lng = startLng + (destLng - startLng) * ease;
        marker.position = { lat, lng };

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    },
    [],
  );

  // Initialize marker imperatively on map load
  useEffect(() => {
    if (!map) return;

    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.width = "40px";
    container.style.height = "40px";
    container.style.cursor = "pointer";
    elementRef.current = container;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: vehicle.latitude, lng: vehicle.longitude },
      content: container,
      title: vehicle.vehicleNumber,
    });

    markerRef.current = marker;

    const listener = marker.addListener("click", () => {
      onClick();
    });

    return () => {
      listener.remove();
      marker.map = null;
    };
  }, [map]);

  // Smooth slide when position changes
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const { lat: prevLat, lng: prevLng } = prevPos.current;
    const newLat = vehicle.latitude;
    const newLng = vehicle.longitude;

    if (!isValidCoordinate(newLat, newLng)) return;

    const dist = haversineDistance(prevLat, prevLng, newLat, newLng);
    if (dist > 1) {
      animateMarkerTo(marker, { lat: newLat, lng: newLng });
      prevPos.current = { lat: newLat, lng: newLng };
    } else {
      marker.position = { lat: newLat, lng: newLng };
    }
  }, [vehicle.latitude, vehicle.longitude, animateMarkerTo]);

  // Rebuild/update HTML content imperatively on heading / status change
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !elementRef.current) return;

    marker.zIndex = isSelected ? 1000 : 1;

    const color =
      vehicle.status === "MOVING"
        ? "#10b981"
        : vehicle.status === "IDLE"
          ? "#f59e0b"
          : "#ef4444";

    const pulseHtml =
      vehicle.status === "MOVING"
        ? `<span style="
          position:absolute;top:-6px;left:-6px;width:52px;height:52px;
          border-radius:50%;border:2px solid ${color};
          animation:pulse-ring 1.5s ease-out infinite;pointer-events:none;
        "></span>`
        : "";

    elementRef.current.innerHTML = `
      <div style="
        position:relative;
        width:40px;height:40px;
        display:flex;align-items:center;justify-content:center;
        transform:rotate(${heading}deg);
        transition:transform 0.6s ease;
      ">
        ${pulseHtml}
        <div style="
          width:36px;height:36px;border-radius:50%;
          background:white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3),0 0 0 2px ${color};
          display:flex;align-items:center;justify-content:center;
          overflow:hidden;
        ">
          <img src="/cargo-truck.png" style="width:22px;height:22px;object-fit:contain;" />
        </div>
      </div>
    `;
  }, [vehicle.status, heading, isSelected]);

  return null;
}



/* -------------------------------------------------- */
/* LIVE STATUS CARD                                   */
/* -------------------------------------------------- */

interface LiveStatusCardProps {
  vehicles: Vehicle[];
  hasSelected: boolean;
}

function LiveStatusCard({ vehicles, hasSelected }: LiveStatusCardProps) {
  const moving = vehicles.filter((v) => v.status === "MOVING").length;
  const idle = vehicles.filter((v) => v.status === "IDLE").length;

  return (
    <div
      className={cn(
        "absolute z-[40] rounded-xl bg-card/90 backdrop-blur-md px-4 py-2.5 shadow-md border border-border select-none transition-all duration-300",
        hasSelected
          ? "bottom-[300px] left-3 md:bottom-4 md:left-4"
          : "bottom-4 left-3 md:bottom-4 md:left-4",
      )}
    >
      <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
        <div className="text-center">
          <p className="text-sm font-extrabold text-success leading-none">
            {moving}
          </p>
          <p className="text-[9px] text-muted-foreground font-bold mt-1">
            Moving
          </p>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="text-center">
          <p className="text-sm font-extrabold text-warning leading-none">
            {idle}
          </p>
          <p className="text-[9px] text-muted-foreground font-bold mt-1">
            Idle
          </p>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="text-center">
          <p className="text-sm font-extrabold text-foreground leading-none">
            {vehicles.length}
          </p>
          <p className="text-[9px] text-muted-foreground font-bold mt-1">
            Total
          </p>
        </div>
      </div>
    </div>
  );
}

interface MapControlsProps {
  onLocate: () => void;
  followMode: boolean;
  onToggleFollow: () => void;
  mapRef: React.RefObject<google.maps.Map | null>;
  hasSelected: boolean;
}

function MapControls({
  onLocate,
  followMode,
  onToggleFollow,
  mapRef,
  hasSelected,
}: MapControlsProps) {
  return (
    <div
      className={cn(
        "absolute z-[40] flex flex-col gap-1.5 transition-all duration-300",
        hasSelected
          ? "bottom-[300px] right-3 md:bottom-4 md:right-4"
          : "bottom-4 right-3 md:bottom-4 md:right-4",
      )}
    >
      <button
        onClick={() =>
          mapRef.current?.setZoom(
            (mapRef.current.getZoom() ?? DEFAULT_ZOOM) + 1,
          )
        }
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/90 backdrop-blur-md border border-border hover:bg-muted/80 text-foreground transition-all cursor-pointer shadow-sm outline-none"
        title="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </button>

      <button
        onClick={() =>
          mapRef.current?.setZoom(
            (mapRef.current.getZoom() ?? DEFAULT_ZOOM) - 1,
          )
        }
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/90 backdrop-blur-md border border-border hover:bg-muted/80 text-foreground transition-all cursor-pointer shadow-sm outline-none"
        title="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </button>

      <button
        onClick={onLocate}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/90 backdrop-blur-md border border-border hover:bg-muted/80 text-foreground transition-all cursor-pointer shadow-sm outline-none"
        title="Center on vehicle"
      >
        <LocateFixed className="h-4 w-4" />
      </button>

      <button
        onClick={onToggleFollow}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all cursor-pointer shadow-sm outline-none ${
          followMode
            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            : "bg-card/90 backdrop-blur-md border-border hover:bg-muted/80 text-foreground"
        }`}
        title={
          followMode ? "Following vehicle (click to stop)" : "Follow vehicle"
        }
      >
        <Navigation2
          className={`h-4 w-4 ${followMode ? "fill-white text-primary-foreground" : "text-foreground"}`}
        />
      </button>
    </div>
  );
}

/* -------------------------------------------------- */
/* MAIN COMPONENT                                     */
/* -------------------------------------------------- */

export default function TrackingMap({
  vehicles,
  selectedVehicle,
  centerTrigger,
  followMode: externalFollowMode = false,
}: TrackingMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    id: "google-map-script",
    libraries: ["marker"],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [internalFollowMode, setInternalFollowMode] = useState(false);
  const [localCenterTrigger, setLocalCenterTrigger] = useState(0);
  const followMode = externalFollowMode || internalFollowMode;

  // Google Maps instance ref
  const mapRef = useRef<google.maps.Map | null>(null);

  // Track last heading per vehicle for rotating icon
  const headingsRef = useRef<Record<string, number>>({});

  // Track whether we've done the initial fitBounds
  const fittedRef = useRef(false);

  const validVehicles = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          v.latitude != null &&
          v.longitude != null &&
          isValidCoordinate(v.latitude, v.longitude),
      ),
    [vehicles],
  );

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
  }, []);

  const fitAllVehicles = useCallback(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance || validVehicles.length === 0) return;

    if (validVehicles.length === 1) {
      mapInstance.setCenter({
        lat: validVehicles[0].latitude,
        lng: validVehicles[0].longitude,
      });
      mapInstance.setZoom(15);
    } else {
      const bounds = new google.maps.LatLngBounds();
      validVehicles.forEach((v) =>
        bounds.extend({ lat: v.latitude, lng: v.longitude }),
      );
      mapInstance.fitBounds(bounds, 80);
    }
  }, [validVehicles]);

  /* ------------------------------------------------ */
  /* FIT ALL VEHICLES on initial map load             */
  /* ------------------------------------------------ */

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);
    // Defer so the map container has rendered at full size
    setTimeout(() => {
      if (!selectedVehicle) {
        fitAllVehicles();
        fittedRef.current = true;
      }
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------ */
  /* CENTER TRIGGER (from parent + locate button)     */
  /* ------------------------------------------------ */

  const effectiveCenterTrigger = centerTrigger + localCenterTrigger;
  const lastCenterTriggerRef = useRef(effectiveCenterTrigger);

  useEffect(() => {
    if (effectiveCenterTrigger === lastCenterTriggerRef.current) return;
    lastCenterTriggerRef.current = effectiveCenterTrigger;

    if (!selectedVehicle) return;
    if (!isValidCoordinate(selectedVehicle.latitude, selectedVehicle.longitude))
      return;
    if (!mapRef.current) return;

    mapRef.current.panTo({
      lat: selectedVehicle.latitude,
      lng: selectedVehicle.longitude,
    });
    mapRef.current.setZoom(16);
  }, [effectiveCenterTrigger, selectedVehicle]);
  const prevSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const prevId = prevSelectedIdRef.current;
    const currId = selectedVehicle?.id ?? null;

    prevSelectedIdRef.current = currId;

    if (!mapRef.current) return;

    if (currId !== null) {
      // A vehicle was selected → pan & zoom in
      if (
        !isValidCoordinate(
          selectedVehicle!.latitude,
          selectedVehicle!.longitude,
        )
      )
        return;
      mapRef.current.panTo({
        lat: selectedVehicle!.latitude,
        lng: selectedVehicle!.longitude,
      });
      mapRef.current.setZoom(16);
    } else if (prevId !== null) {
      fitAllVehicles();
    }
  }, [selectedVehicle?.id]);

  useEffect(() => {
    if (!followMode || !selectedVehicle) return;
    if (!isValidCoordinate(selectedVehicle.latitude, selectedVehicle.longitude))
      return;
    if (!mapRef.current) return;

    mapRef.current.panTo({
      lat: selectedVehicle.latitude,
      lng: selectedVehicle.longitude,
    });
  }, [
    followMode,
    selectedVehicle,
    selectedVehicle?.latitude,
    selectedVehicle?.longitude,
  ]);

  useEffect(() => {
    const vehicleIds = new Set(vehicles.map((v) => v.id));

    // Update headings for marker rotation
    const prevPositions: Record<string, { lat: number; lng: number }> = {};

    for (const vehicle of vehicles) {
      if (!isValidCoordinate(vehicle.latitude, vehicle.longitude)) continue;

      const prev = prevPositions[vehicle.id];
      if (prev) {
        const dist = haversineDistance(
          prev.lat,
          prev.lng,
          vehicle.latitude,
          vehicle.longitude,
        );
        if (dist >= 10) {
          const bearing = calculateBearing(
            prev.lat,
            prev.lng,
            vehicle.latitude,
            vehicle.longitude,
          );
          headingsRef.current[vehicle.id] = bearing;
        }
      }

      prevPositions[vehicle.id] = {
        lat: vehicle.latitude,
        lng: vehicle.longitude,
      };
    }

    // Clean up stale heading entries
    for (const id of Object.keys(headingsRef.current)) {
      if (!vehicleIds.has(id)) {
        delete headingsRef.current[id];
      }
    }
  }, [vehicles]);

  const visibleVehicles = selectedVehicle
    ? validVehicles.filter((v) => v.id === selectedVehicle.id)
    : validVehicles;

  const handleDragStart = useCallback(() => {
    setInternalFollowMode(false);
  }, []);
  if (!isLoaded) {
    return (
      <div className="relative h-full min-h-[300px] md:min-h-[350px] w-full overflow-hidden flex items-center justify-center bg-muted">
        <span className="text-muted-foreground text-sm">Loading map…</span>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[300px] md:min-h-[350px] w-full overflow-hidden">
      {/* LIVE BADGE */}
      <div className="absolute right-4 top-4 z-[40] flex items-center gap-2 rounded-lg bg-card/90 backdrop-blur-md px-3.5 py-1.5 shadow-sm border border-border">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-full w-full rounded-full bg-success" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
          Live Tracking
        </span>
      </div>

      {/* STATUS CARD */}
      <LiveStatusCard
        vehicles={vehicles}
        hasSelected={selectedVehicle !== null}
      />

      {/* MAP CONTROLS (outside GoogleMap so they remain above the map) */}
      <MapControls
        onLocate={() => setLocalCenterTrigger((prev) => prev + 1)}
        followMode={internalFollowMode}
        onToggleFollow={() => setInternalFollowMode((v) => !v)}
        mapRef={mapRef}
        hasSelected={selectedVehicle !== null}
      />

      {/* GOOGLE MAP */}
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={DEFAULT_LOCATION}
        zoom={DEFAULT_ZOOM}
        options={MAP_OPTIONS}
        onLoad={handleMapLoad}
        onUnmount={handleMapUnmount}
        onDragStart={handleDragStart}
      >


        {/* VEHICLE MARKERS */}
        {map &&
          visibleVehicles.map((vehicle) => {
            const heading = headingsRef.current[vehicle.id] ?? 0;

            return (
              <VehicleMarker
                key={vehicle.id}
                map={map}
                vehicle={vehicle}
                heading={heading}
                isSelected={selectedVehicle?.id === vehicle.id}
                onClick={() => {}}
              />
            );
          })}
      </GoogleMap>
    </div>
  );
}
