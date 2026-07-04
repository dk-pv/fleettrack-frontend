"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";

import { GeoPoint, RoutePoint, RoutePointType } from "@/types/trip";

/* Same loader config as the tracking map so the Google JS API is shared. */
const MAP_LIBRARIES: "marker"[] = ["marker"];

const CONTAINER_STYLE: React.CSSProperties = { width: "100%", height: "100%" };
const DEFAULT_CENTER = { lat: 9.9312, lng: 76.2673 }; // Kochi
const DEFAULT_ZOOM = 8;

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  gestureHandling: "greedy",
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

const COLORS: Record<RoutePointType, string> = {
  pickup: "#16a34a",
  stop: "#2563eb",
  destination: "#ef4444",
};

const WRAPPER_CLASS =
  "relative h-[300px] w-full overflow-hidden rounded-2xl border border-border sm:h-[380px]";

interface Props {
  points: RoutePoint[];
  vehiclePosition?: GeoPoint | null;
  loading?: boolean;
}

export default function TripRouteMap({
  points,
  vehiclePosition = null,
  loading = false,
}: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    id: "google-map-script",
    libraries: MAP_LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  // Latest live position, read by fitToPoints without being a dependency — so the
  // map frames the vehicle on load but does NOT refit on every live tick (the
  // marker moves on its own; refitting each update would make the map jump around).
  const vehiclePositionRef = useRef<GeoPoint | null>(vehiclePosition);
  useEffect(() => {
    vehiclePositionRef.current = vehiclePosition;
  }, [vehiclePosition]);

  const fitToPoints = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const coords = points.map((p) => p.coords);
    const vp = vehiclePositionRef.current;
    if (vp) coords.push(vp);
    if (coords.length === 0) return;

    if (coords.length === 1) {
      map.setCenter(coords[0]);
      map.setZoom(13);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    coords.forEach((c) => bounds.extend(c));
    map.fitBounds(bounds, 60);
  }, [points]);

  const handleLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      fitToPoints();
    },
    [fitToPoints],
  );

  // Refit when the route changes (e.g. live preview updates in the modal) — not
  // on live position ticks, which only move the marker (see fitToPoints).
  useEffect(() => {
    fitToPoints();
  }, [fitToPoints]);

  if (loading || !isLoaded) {
    return (
      <div className={`${WRAPPER_CLASS} flex items-center justify-center bg-muted`}>
        <span className="text-sm text-muted-foreground">Loading map…</span>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className={`${WRAPPER_CLASS} flex items-center justify-center bg-muted`}>
        <span className="text-sm text-muted-foreground">
          No route to preview
        </span>
      </div>
    );
  }

  return (
    <div className={WRAPPER_CLASS}>
      <GoogleMap
        mapContainerStyle={CONTAINER_STYLE}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        options={MAP_OPTIONS}
        onLoad={handleLoad}
        onUnmount={() => {
          mapRef.current = null;
        }}
      >
        <Polyline
          path={points.map((p) => p.coords)}
          options={{
            strokeColor: "#2563eb",
            strokeOpacity: 0.85,
            strokeWeight: 3,
          }}
        />

        {points.map((point, index) => (
          <Marker
            key={`${point.type}-${index}`}
            position={point.coords}
            title={point.label}
            label={
              point.type === "stop" && point.sequence
                ? {
                    text: String(point.sequence),
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "700",
                  }
                : undefined
            }
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: point.type === "stop" ? 8 : 9,
              fillColor: COLORS[point.type],
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        ))}

        {vehiclePosition && (
          <Marker
            position={vehiclePosition}
            title="Current vehicle position"
            zIndex={1000}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: "#7c3aed",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            }}
          />
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="absolute left-3 top-3 z-[5] flex flex-col gap-1 rounded-lg border border-border bg-card/90 px-3 py-2 text-[10px] font-medium shadow-sm backdrop-blur-md">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: COLORS.pickup }}
          />
          Pickup
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: COLORS.stop }}
          />
          Stop
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: COLORS.destination }}
          />
          Destination
        </span>
        {vehiclePosition && (
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: "#7c3aed" }}
            />
            Vehicle
          </span>
        )}
      </div>
    </div>
  );
}
