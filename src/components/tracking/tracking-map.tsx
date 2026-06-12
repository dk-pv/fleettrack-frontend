"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.marker.slideto";

import {
  MapContainer,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { LocateFixed, Minus, Navigation2, Plus } from "lucide-react";
import {
  buildFadedTrailSegments,
  calculateBearing,
  enrichWithHeadings,
  filterGPSNoise,
  haversineDistance,
  isValidCoordinate,
  sortAndDedupeTrail,
  type TrailPoint,
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

const DEFAULT_LOCATION: [number, number] = [11.2588, 75.7804];
const MAX_TRAIL_POINTS = 300;
const TRAIL_COLOR = "#3b82f6";
const MOVING_COLOR = "#10b981";

/* -------------------------------------------------- */
/* ROTATING VEHICLE ICON                              */
/* -------------------------------------------------- */

function createVehicleIcon(heading: number, status: string): L.DivIcon {
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

  return L.divIcon({
    html: `
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
    `,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
}

/* -------------------------------------------------- */
/* VEHICLE MARKER (with smooth slide + rotation)      */
/* -------------------------------------------------- */

interface VehicleMarkerProps {
  vehicle: Vehicle;
  heading: number;
  isSelected: boolean;
  onClick: () => void;
}

function VehicleMarker({
  vehicle,
  heading,
  isSelected,
  onClick,
}: VehicleMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null);
  const prevPos = useRef<[number, number]>([
    vehicle.latitude,
    vehicle.longitude,
  ]);
  const map = useMap();

  // Create the icon
  const icon = useMemo(
    () => createVehicleIcon(heading, vehicle.status),
    [heading, vehicle.status],
  );

  // Initialize marker once
  useEffect(() => {
    if (!map) return;

    const marker = L.marker([vehicle.latitude, vehicle.longitude], {
      icon,
      zIndexOffset: isSelected ? 1000 : 0,
    });

    marker.on("click", onClick);
    marker.addTo(map);
    markerRef.current = marker;

    prevPos.current = [vehicle.latitude, vehicle.longitude];

    return () => {
      marker.removeFrom(map);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, vehicle.id]);

  // Update icon when heading/status changes
  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setIcon(icon);
    markerRef.current.setZIndexOffset(isSelected ? 1000 : 0);
  }, [icon, isSelected]);

  // Smooth slide to new position
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const [prevLat, prevLng] = prevPos.current;
    const newLat = vehicle.latitude;
    const newLng = vehicle.longitude;

    if (!isValidCoordinate(newLat, newLng)) return;

    const dist = haversineDistance(prevLat, prevLng, newLat, newLng);
    // Only animate if actually moved (avoids jitter on same position)
    if (dist > 1) {
      (marker as any).slideTo([newLat, newLng], {
        duration: 1500,
        keepAtCenter: false,
      });
      prevPos.current = [newLat, newLng];
    }
  }, [vehicle.latitude, vehicle.longitude]);

  return null;
}

/* -------------------------------------------------- */
/* MAP CONTROLLER (recenter / follow)                 */
/* -------------------------------------------------- */

function MapController({
  selectedVehicle,
  centerTrigger,
  followMode,
  onDragStart,
}: {
  selectedVehicle: Vehicle | null;
  centerTrigger: number;
  followMode: boolean;
  onDragStart: () => void;
}) {
  const map = useMap();
  const lastCenterTrigger = useRef(centerTrigger);

  useMapEvents({
    dragstart: () => {
      onDragStart();
    },
  });

  // Pan to center on button press
  useEffect(() => {
    if (!selectedVehicle) return;
    if (!isValidCoordinate(selectedVehicle.latitude, selectedVehicle.longitude))
      return;

    map.setView([selectedVehicle.latitude, selectedVehicle.longitude], 16, {
      animate: true,
    });
    lastCenterTrigger.current = centerTrigger;
  }, [centerTrigger, map, selectedVehicle]);

  // Follow mode: smooth pan when selected vehicle moves
  useEffect(() => {
    if (!followMode || !selectedVehicle) return;
    if (!isValidCoordinate(selectedVehicle.latitude, selectedVehicle.longitude))
      return;

    map.panTo([selectedVehicle.latitude, selectedVehicle.longitude], {
      animate: true,
      duration: 0.8,
    });
  }, [
    followMode,
    selectedVehicle,
    selectedVehicle?.latitude,
    selectedVehicle?.longitude,
    map,
  ]);

  return null;
}

/* -------------------------------------------------- */
/* FIT ALL VEHICLES                                   */
/* -------------------------------------------------- */

function FitAllVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || vehicles.length === 0) return;

    const valid = vehicles.filter((v) =>
      isValidCoordinate(v.latitude, v.longitude),
    );
    if (valid.length === 0) return;

    if (valid.length === 1) {
      map.setView([valid[0].latitude, valid[0].longitude], 15, {
        animate: true,
      });
    } else {
      const bounds = L.latLngBounds(
        valid.map((v) => [v.latitude, v.longitude]),
      );
      map.fitBounds(bounds, { padding: [80, 80], animate: true });
    }

    fitted.current = true;
  }, [vehicles, map]);

  return null;
}

/* -------------------------------------------------- */
/* MAP CONTROLS                                       */
/* -------------------------------------------------- */

function MapControls({
  onLocate,
  followMode,
  onToggleFollow,
}: {
  onLocate: () => void;
  followMode: boolean;
  onToggleFollow: () => void;
}) {
  const map = useMap();
  return (
    <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-2.5 md:gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="flex h-12 w-12 md:h-10 md:w-10 items-center justify-center rounded-xl bg-white shadow-lg hover:bg-gray-50 dark:bg-[#1f2937] dark:hover:bg-[#263548] transition-all"
        title="Zoom in"
      >
        <Plus className="h-5 w-5 md:h-4 md:w-4" />
      </button>

      <button
        onClick={() => map.zoomOut()}
        className="flex h-12 w-12 md:h-10 md:w-10 items-center justify-center rounded-xl bg-white shadow-lg hover:bg-gray-50 dark:bg-[#1f2937] dark:hover:bg-[#263548] transition-all"
        title="Zoom out"
      >
        <Minus className="h-5 w-5 md:h-4 md:w-4" />
      </button>

      <button
        onClick={onLocate}
        className="flex h-12 w-12 md:h-10 md:w-10 items-center justify-center rounded-xl bg-white shadow-lg hover:bg-gray-50 dark:bg-[#1f2937] dark:hover:bg-[#263548] transition-all"
        title="Center on vehicle"
      >
        <LocateFixed className="h-5 w-5 md:h-4 md:w-4" />
      </button>

      <button
        onClick={onToggleFollow}
        className={`flex h-12 w-12 md:h-10 md:w-10 items-center justify-center rounded-xl shadow-lg transition-all ${
          followMode
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-white hover:bg-gray-50 dark:bg-[#1f2937] dark:hover:bg-[#263548]"
        }`}
        title={
          followMode ? "Following vehicle (click to stop)" : "Follow vehicle"
        }
      >
        <Navigation2 className={`h-5 w-5 md:h-4 md:w-4 ${followMode ? "fill-white" : ""}`} />
      </button>
    </div>
  );
}

/* -------------------------------------------------- */
/* LIVE STATUS CARD                                   */
/* -------------------------------------------------- */

function LiveStatusCard({ vehicles }: { vehicles: Vehicle[] }) {
  const moving = vehicles.filter((v) => v.status === "MOVING").length;
  const idle = vehicles.filter((v) => v.status === "IDLE").length;

  return (
    <div className="absolute top-4 left-4 md:top-auto md:bottom-4 md:left-4 z-[400] rounded-2xl bg-white/95 backdrop-blur-sm px-3.5 py-2 md:px-5 md:py-3 shadow-xl dark:bg-[#1a2236]/95 border border-white/20">
      <div className="flex gap-3 md:gap-5">
        <div className="text-center">
          <p className="text-lg md:text-xl font-bold text-emerald-500">{moving}</p>
          <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5">
            Moving
          </p>
        </div>

        <div className="w-px bg-border" />

        <div className="text-center">
          <p className="text-lg md:text-xl font-bold text-amber-500">{idle}</p>
          <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5">
            Idle
          </p>
        </div>

        <div className="w-px bg-border" />

        <div className="text-center">
          <p className="text-lg md:text-xl font-bold text-blue-500">{vehicles.length}</p>
          <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5">
            Total
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* TRAIL RENDERER                                     */
/* -------------------------------------------------- */

function TrailRenderer({ points }: { points: TrailPoint[] }) {
  const segments = useMemo(() => buildFadedTrailSegments(points), [points]);

  if (segments.length === 0) return null;

  return (
    <>
      {segments.map((seg, idx) => (
        <Polyline
          key={idx}
          positions={seg.positions}
          pathOptions={{
            color: TRAIL_COLOR,
            weight: seg.weight,
            opacity: seg.opacity,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      ))}
      {/* Direction arrow at the tip */}
      {points.length >= 2 && (
        <Polyline
          positions={[
            [points[points.length - 2].lat, points[points.length - 2].lng],
            [points[points.length - 1].lat, points[points.length - 1].lng],
          ]}
          pathOptions={{
            color: MOVING_COLOR,
            weight: 5,
            opacity: 1,
            lineCap: "round",
          }}
        />
      )}
    </>
  );
}

/* -------------------------------------------------- */
/* MAIN COMPONENT                                     */
/* -------------------------------------------------- */

// Inject pulse-ring keyframes into document head once
if (typeof window !== "undefined") {
  const styleId = "ft-pulse-ring-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 0.8; }
        80% { transform: scale(1.8); opacity: 0; }
        100% { transform: scale(1.8); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

export default function TrackingMap({
  vehicles,
  selectedVehicle,
  centerTrigger,
  followMode: externalFollowMode = false,
}: TrackingMapProps) {
  // Trail state: vehicleId → sorted, filtered TrailPoint[]
  const [vehicleTrails, setVehicleTrails] = useState<
    Record<string, TrailPoint[]>
  >({});
  const [internalFollowMode, setInternalFollowMode] = useState(false);
  const [localCenterTrigger, setLocalCenterTrigger] = useState(0);
  const followMode = externalFollowMode || internalFollowMode;

  // Track last heading per vehicle for rotating icon
  const headingsRef = useRef<Record<string, number>>({});
  const loadedHistoriesRef = useRef<Record<string, boolean>>({});

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

  /* ------------------------------------------------ */
  /* LOAD HISTORY when selected vehicle changes       */
  /* ------------------------------------------------ */

  useEffect(() => {
    if (!selectedVehicle) return;

    // Check if already loaded
    if (loadedHistoriesRef.current[selectedVehicle.id]) {
      return;
    }

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vehicles/${selectedVehicle.id}/history`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!data.success || !Array.isArray(data.history)) return;

        const rawPoints: TrailPoint[] = data.history
          .filter((h: any) => isValidCoordinate(h.latitude, h.longitude))
          .map((h: any) => ({
            lat: h.latitude,
            lng: h.longitude,
            timestamp: h.timestamp ?? new Date(h.createdAt).getTime(),
            heading: h.heading ?? 0,
            speed: h.speed ?? 0,
          }));

        const sorted = sortAndDedupeTrail(rawPoints);
        const filtered = filterGPSNoise(sorted, 10);
        const enriched = enrichWithHeadings(filtered);

        setVehicleTrails((prev) => {
          const existing = prev[selectedVehicle.id] ?? [];
          const combined = [...enriched, ...existing];
          const sortedCombined = sortAndDedupeTrail(combined);
          const filteredCombined = filterGPSNoise(sortedCombined, 10);
          const finalTrails = enrichWithHeadings(filteredCombined).slice(-MAX_TRAIL_POINTS);

          return {
            ...prev,
            [selectedVehicle.id]: finalTrails,
          };
        });

        // Update heading ref from most recent history point
        if (enriched.length > 0) {
          headingsRef.current[selectedVehicle.id] =
            enriched[enriched.length - 1].heading ?? 0;
        }

        // Mark as loaded
        loadedHistoriesRef.current[selectedVehicle.id] = true;
      } catch (err) {
        console.error("History fetch failed:", err);
      }
    };

    fetchHistory();
  }, [selectedVehicle?.id]);

  /* ------------------------------------------------ */
  /* LIVE UPDATE — append new trail point             */
  /* ------------------------------------------------ */

  useEffect(() => {
    const vehicleIds = new Set(vehicles.map((v) => v.id));

    setVehicleTrails((prev) => {
      const updated = { ...prev };

      // Clean up old vehicle trails
      for (const id of Object.keys(updated)) {
        if (!vehicleIds.has(id)) {
          delete updated[id];
        }
      }

      for (const vehicle of vehicles) {
        if (!isValidCoordinate(vehicle.latitude, vehicle.longitude)) continue;

        const now = vehicle.timestamp ?? Date.now();
        const newPoint: TrailPoint = {
          lat: vehicle.latitude,
          lng: vehicle.longitude,
          timestamp: now,
          heading: 0,
          speed: vehicle.speed,
        };

        const existing = updated[vehicle.id] ?? [];

        // GPS noise filter
        if (existing.length > 0) {
          const last = existing[existing.length - 1];
          const dist = haversineDistance(
            last.lat,
            last.lng,
            newPoint.lat,
            newPoint.lng,
          );
          if (dist < 10) continue; // < 10m → skip

          // Calculate heading
          const bearing = calculateBearing(
            last.lat,
            last.lng,
            newPoint.lat,
            newPoint.lng,
          );
          newPoint.heading = bearing;
          headingsRef.current[vehicle.id] = bearing;
        }

        const merged = [...existing, newPoint].slice(-MAX_TRAIL_POINTS);
        updated[vehicle.id] = merged;
      }

      return updated;
    });

    // Also clean up headingsRef and loadedHistoriesRef
    for (const id of Object.keys(headingsRef.current)) {
      if (!vehicleIds.has(id)) {
        delete headingsRef.current[id];
      }
    }
    for (const id of Object.keys(loadedHistoriesRef.current)) {
      if (!vehicleIds.has(id)) {
        delete loadedHistoriesRef.current[id];
      }
    }
  }, [vehicles]);

  const visibleVehicles = selectedVehicle
    ? validVehicles.filter((v) => v.id === selectedVehicle.id)
    : validVehicles;

  /* ------------------------------------------------ */
  /* RENDER                                           */
  /* ------------------------------------------------ */

  return (
    <div className="relative h-full min-h-[300px] md:min-h-[350px] w-full overflow-hidden">
      {/* LIVE BADGE */}
      <div className="absolute right-4 top-4 z-[400] flex items-center gap-1.5 md:gap-2 rounded-xl bg-white/95 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 shadow-lg dark:bg-[#1a2236]/95 border border-white/10">
        <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-full w-full rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs md:text-sm font-semibold tracking-tight">
          Live Tracking
        </span>
      </div>

      {/* STATUS CARD */}
      <LiveStatusCard vehicles={vehicles} />

      {/* MAP */}
      <MapContainer
        center={DEFAULT_LOCATION}
        zoom={8}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        zoomControl={false}
        preferCanvas
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={20}
        />

        {/* Fit to all vehicles on initial load */}
        {!selectedVehicle && <FitAllVehicles vehicles={validVehicles} />}

        {/* Recenter / follow */}
        <MapController
          selectedVehicle={selectedVehicle}
          centerTrigger={centerTrigger + localCenterTrigger}
          followMode={followMode}
          onDragStart={() => setInternalFollowMode(false)}
        />

        {/* TRAIL POLYLINES */}
        {validVehicles.map((vehicle) => {
          const trail = vehicleTrails[vehicle.id];
          if (!trail || trail.length < 2) return null;
          if (selectedVehicle && selectedVehicle.id !== vehicle.id) return null;

          return <TrailRenderer key={`trail-${vehicle.id}`} points={trail} />;
        })}

        {/* VEHICLE MARKERS */}
        {visibleVehicles.map((vehicle) => {
          const heading = headingsRef.current[vehicle.id] ?? 0;

          return (
            <VehicleMarker
              key={vehicle.id}
              vehicle={vehicle}
              heading={heading}
              isSelected={selectedVehicle?.id === vehicle.id}
              onClick={() => {}}
            />
          );
        })}

        {/* MAP CONTROLS */}
        <MapControls
          onLocate={() => setLocalCenterTrigger((prev) => prev + 1)}
          followMode={internalFollowMode}
          onToggleFollow={() => setInternalFollowMode((v) => !v)}
        />
      </MapContainer>
    </div>
  );
}
