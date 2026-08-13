"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FLOAT_PANE,
  GoogleMap,
  OverlayViewF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { LocateFixed, Minus, Navigation2, Plus } from "lucide-react";
import {
  calculateBearing,
  haversineDistance,
  isValidCoordinate,
} from "@/lib/gps-utils";
import VehiclePopupCard from "./vehicle-popup-card";

/* -------------------------------------------------- */
/* TYPES                                              */
/* -------------------------------------------------- */

export interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleNumber: string;
  gpsDeviceId: string;
  driverName: string;
  status: string;
  latitude: number;
  longitude: number;
  speed: number;
  updatedAt: string;
  timestamp?: number;
  ignition?: boolean;
  batteryVoltage?: number;
  client?: {
    id: string;
    name: string;
  };
}

interface TrackingMapProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  /** External "re-centre on the selection" pulse. The map also has its own (see
   *  MapControls / the popup card), so a caller that doesn't need one can omit it. */
  centerTrigger?: number;
  followMode?: boolean;
  /** Fired on a marker click. The map only ever SELECTS — it never deselects, so nothing
   *  the user does on the map can reset the caller's selection. Clearing it is an explicit
   *  action elsewhere (the vehicle list's "All Vehicles"), hence the `null` in the type. */
  onVehicleSelect?: (vehicle: Vehicle | null) => void;
  /** Allow the compact popup card over a clicked marker. /tracking opts in; the
   *  single-vehicle /tracking/[id] route keeps its own side panel instead. */
  showVehicleCard?: boolean;
}

/* -------------------------------------------------- */
/* CONSTANTS                                          */
/* -------------------------------------------------- */

const DEFAULT_LOCATION = { lat: 11.2588, lng: 75.7804 };
const DEFAULT_ZOOM = 8;

// Stable reference — an inline array would make useJsApiLoader reload the script.
const MAP_LIBRARIES: "marker"[] = ["marker"];

const MAP_CONTAINER_STYLE: React.CSSProperties = {
  height: "100%",
  width: "100%",
};

// AdvancedMarkerElement requires a mapId. With a mapId present Google ignores the
// inline `styles` array (and warns) — POI/transit hiding must be done via Cloud
// styling on the mapId, so `styles` is intentionally omitted here.
const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  gestureHandling: "greedy",
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: false,
  clickableIcons: false,
  mapId: "DEMO_MAP_ID",
};

/* -------------------------------------------------- */
/* HEADING (RC3 / RC4)                                */
/* -------------------------------------------------- */

/** Below this the vehicle is treated as stationary/slow → keep its last heading. */
const MIN_MOVING_SPEED_KMH = 3;
/** Minimum displacement before a bearing is trusted (ignores GPS jitter). */
const MIN_HEADING_DISTANCE_M = 10;

/** Shortest signed angular difference from → to, normalised to (-180, 180]. */
function shortestAngleDelta(from: number, to: number): number {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  else if (d < -180) d += 360;
  return d;
}

/* -------------------------------------------------- */
/* MARKER MOVEMENT (RC6 / RC7 / RC15)                 */
/* -------------------------------------------------- */

/** Below this a position change is snapped directly (no animation). */
const MOVE_THRESHOLD_M = 1;
/** RC6: a single move beyond this is treated as a GPS spike and ignored… */
const MAX_JUMP_DISTANCE_M = 5000;
/** …unless it persists this many samples, then it's accepted as the new reality
 *  (so a genuine relocation can never leave the marker stuck forever). */
const MAX_CONSECUTIVE_REJECTS = 2;
/** RC7: animation duration scales with distance, then clamped to [min, max] ms. */
const ANIM_MS_PER_METER = 3;
const ANIM_MIN_MS = 400;
const ANIM_MAX_MS = 4000;

/* -------------------------------------------------- */
/* MARKER STACKING (RC14)                             */
/* -------------------------------------------------- */

/** Selected marker always renders above every base marker. */
const SELECTED_Z_INDEX = 1_000_000;
/** RC14: deterministic z from latitude so overlapping markers stack the same way on
 *  every render (further south → higher z → drawn on top), instead of all sharing
 *  z=1 and flickering when the DOM/insertion order changes. */
function baseZIndex(latitude: number): number {
  return Math.round((90 - latitude) * 1000);
}

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
  const animationFrameRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const prevPos = useRef<{ lat: number; lng: number }>({
    lat: vehicle.latitude,
    lng: vehicle.longitude,
  });
  // RC7: arrival time of the last accepted position (for interval-based duration).
  const prevUpdateTimeRef = useRef<number | null>(null);
  // RC6: consecutive rejected-jump counter (recovery guard).
  const rejectCountRef = useRef(0);
  // RC5: the persistent rotate wrapper (built once) + the latest heading, so a heading
  // change only mutates the wrapper's transform instead of rebuilding the whole marker.
  const wrapperRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef(heading);
  // RC8: keep the latest onClick in a ref so the click listener (bound once) never
  // fires a stale closure — without re-subscribing on every render.
  const onClickRef = useRef(onClick);
  useEffect(() => {
    onClickRef.current = onClick;
  });

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  // RC15: stop any in-flight animation so a running frame can't overwrite a
  // subsequent direct position set (animation fighting).
  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Smooth animated move toward new position
  const animateMarkerTo = useCallback(
    (
      marker: google.maps.marker.AdvancedMarkerElement,
      destination: { lat: number; lng: number },
      duration: number,
    ) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

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

      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        const lat = startLat + (destLat - startLat) * ease;
        const lng = startLng + (destLng - startLng) * ease;

        marker.position = { lat, lng };

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(step);
    },
    [],
  );

  // Create the AdvancedMarkerElement. This component is only mounted once the parent
  // confirms the map is authorized and rendered (the `tilesloaded` gate), so `map` is
  // always a live, authorized instance here — the marker-library precondition below is
  // a final belt-and-suspenders check. This is a real readiness gate, NOT a try/catch:
  // markers never construct against a dead map, so the internal marker.js crashes
  // ("reading 'keys'" / IntersectionObserver.observe on undefined) can't occur.
  useEffect(() => {
    if (!map || !google.maps.marker?.AdvancedMarkerElement) return;

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
      // Native hover tooltip showing the vehicle number (also the marker's aria-label).
      title: vehicle.vehicleNumber,
      // Required for `gmp-click`. The legacy MVC "click" event enabled itself as soon as
      // a listener was attached; the DOM event does not — without this, clicks are dead.
      gmpClickable: true,
    });

    markerRef.current = marker;

    // AdvancedMarkerElement extends HTMLElement, so this is a real DOM event. Google
    // deprecated `addListener("click")` on it ("[gmp-advanced-marker]: Please use
    // addEventListener('gmp-click', ...)"). Named handler so the cleanup below removes
    // this exact reference; the effect is keyed on [map], so it binds once per map and
    // a re-render cannot stack duplicate listeners (onClick is read via onClickRef).
    const handleClick = () => {
      onClickRef.current();
    };
    marker.addEventListener("gmp-click", handleClick);

    return () => {
      marker.removeEventListener("gmp-click", handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      marker.map = null;
    };
  }, [map]);

  // Smooth slide when position changes
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const newLat = vehicle.latitude;
    const newLng = vehicle.longitude;

    if (!isValidCoordinate(newLat, newLng)) return;

    const { lat: prevLat, lng: prevLng } = prevPos.current;
    const dist = haversineDistance(prevLat, prevLng, newLat, newLng);

    // RC6: ignore a physically impossible jump (GPS spike) and keep the last valid
    // position. A lone spike is skipped; if it persists past MAX_CONSECUTIVE_REJECTS
    // it is accepted as the new reality, so the marker can never get stuck forever.
    if (dist > MAX_JUMP_DISTANCE_M) {
      if (rejectCountRef.current < MAX_CONSECUTIVE_REJECTS) {
        rejectCountRef.current += 1;
        return;
      }
    }
    rejectCountRef.current = 0;

    // RC7: real gap since the last accepted position.
    const now = performance.now();
    const intervalMs =
      prevUpdateTimeRef.current !== null ? now - prevUpdateTimeRef.current : null;
    prevUpdateTimeRef.current = now;

    if (dist > MOVE_THRESHOLD_M) {
      // RC7: duration scales with distance (consistent visual speed), clamped, and
      // capped by the update interval so the next update doesn't cut it short.
      let duration = Math.min(
        Math.max(dist * ANIM_MS_PER_METER, ANIM_MIN_MS),
        ANIM_MAX_MS,
      );
      // Cap to the interval but keep a small non-zero floor (avoids a 0ms/NaN step).
      if (intervalMs !== null) duration = Math.min(duration, Math.max(intervalMs, 50));

      animateMarkerTo(marker, { lat: newLat, lng: newLng }, duration);
      prevPos.current = { lat: newLat, lng: newLng };
    } else {
      // RC15: a tiny move snaps directly — cancel any in-flight animation first so a
      // running frame can't overwrite this position (animation fighting).
      stopAnimation();
      marker.position = { lat: newLat, lng: newLng };
      prevPos.current = { lat: newLat, lng: newLng };
    }
  }, [vehicle.latitude, vehicle.longitude, animateMarkerTo, stopAnimation]);

  // RC14: deterministic stacking — selected always on top, otherwise ordered by
  // latitude so overlapping markers keep a stable draw order (no z=1 flicker).
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.zIndex = isSelected ? SELECTED_Z_INDEX : baseZIndex(vehicle.latitude);
  }, [isSelected, vehicle.latitude]);

  // RC5: rebuild the marker's DOM only when status changes (color / pulse). Heading
  // ticks no longer trigger this innerHTML rebuild — they only mutate the transform.
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

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

    el.innerHTML = `
      <div style="
        position:relative;
        width:40px;height:40px;
        display:flex;align-items:center;justify-content:center;
        transform:rotate(${headingRef.current}deg);
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

    // RC5: cache the rotate wrapper so heading updates only touch its transform.
    wrapperRef.current = el.firstElementChild as HTMLElement | null;
  }, [vehicle.status]);

  // RC5: a heading change only rotates the persistent wrapper — no DOM rebuild.
  useEffect(() => {
    headingRef.current = heading;
    if (wrapperRef.current) {
      wrapperRef.current.style.transform = `rotate(${heading}deg)`;
    }
  }, [heading]);

  return null;
}

/* -------------------------------------------------- */
/* LIVE STATUS CARD                                   */
/* -------------------------------------------------- */

interface LiveStatusCardProps {
  vehicles: Vehicle[];
}

// Stays pinned bottom-left. It used to jump up to bottom-[300px] on mobile to clear the
// selected-vehicle bottom sheet; the sheet is gone, so the position is now constant.
function LiveStatusCard({ vehicles }: LiveStatusCardProps) {
  const moving = vehicles.filter((v) => v.status === "MOVING").length;
  const idle = vehicles.filter((v) => v.status === "IDLE").length;

  return (
    <div className="absolute bottom-4 left-3 z-[40] rounded-lg bg-card px-4 py-2.5 shadow-sm border border-border select-none md:left-4">
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
}

function MapControls({
  onLocate,
  followMode,
  onToggleFollow,
  mapRef,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-4 right-3 z-[40] flex flex-col gap-1.5 md:right-4">
      <button
        onClick={() =>
          mapRef.current?.setZoom(
            (mapRef.current.getZoom() ?? DEFAULT_ZOOM) + 1,
          )
        }
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border border-border hover:bg-muted/80 text-foreground transition-all cursor-pointer shadow-sm outline-none"
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
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border border-border hover:bg-muted/80 text-foreground transition-all cursor-pointer shadow-sm outline-none"
        title="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </button>

      <button
        onClick={onLocate}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-card border border-border hover:bg-muted/80 text-foreground transition-all cursor-pointer shadow-sm outline-none"
        title="Center on vehicle"
      >
        <LocateFixed className="h-4 w-4" />
      </button>

      <button
        onClick={onToggleFollow}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all cursor-pointer shadow-sm outline-none ${
          followMode
            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            : "bg-card border-border hover:bg-muted/80 text-foreground"
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
  centerTrigger = 0,
  followMode: externalFollowMode = false,
  onVehicleSelect,
  showVehicleCard = false,
}: TrackingMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    id: "google-map-script",
    libraries: MAP_LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  // Map READINESS gate. `onLoad` fires with a map instance even when authorization
  // later fails, so it is NOT a safe signal to attach AdvancedMarkerElements. The
  // map's `tilesloaded` event fires only once the map is authorized AND has actually
  // rendered — the definitive "safe to create markers" signal. On a
  // RefererNotAllowedMapError the tiles never render, so this stays false and markers
  // are never constructed against a dead map (which is what throws inside marker.js).
  const [mapReady, setMapReady] = useState(false);
  const [internalFollowMode, setInternalFollowMode] = useState(false);
  const [localCenterTrigger, setLocalCenterTrigger] = useState(0);
  const followMode = externalFollowMode || internalFollowMode;

  // useJsApiLoader's `loadError` only covers SCRIPT-load failures. An invalid key or a
  // referrer that isn't authorized (RefererNotAllowedMapError) loads the script fine
  // but fails auth AFTER — Google signals that via the global `window.gm_authFailure`.
  // Catch it so the map degrades to the fallback UI instead of rendering a dead map.
  const [authFailed, setAuthFailed] = useState(false);
  useEffect(() => {
    const w = window as unknown as { gm_authFailure?: () => void };
    w.gm_authFailure = () => setAuthFailed(true);
    return () => {
      w.gm_authFailure = undefined;
    };
  }, []);

  // Google Maps instance ref
  const mapRef = useRef<google.maps.Map | null>(null);

  // Track last heading per vehicle for rotating icon
  const headingsRef = useRef<Record<string, number>>({});

  const prevPositionsRef = useRef<Record<string, { lat: number; lng: number }>>(
    {},
  );

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
    setMapReady(false);
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

  const handleMapLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      mapRef.current = mapInstance;
      setMap(mapInstance);

      // Mark the map ready only after tiles actually render — proof that auth
      // succeeded. This gates marker creation (see the markers block below), so a
      // map left dead by an auth failure never gets AdvancedMarkerElements attached.
      google.maps.event.addListenerOnce(mapInstance, "tilesloaded", () => {
        setMapReady(true);
      });

      setTimeout(() => {
        if (!selectedVehicle) {
          fitAllVehicles();
        }
      }, 100);
    },
    [selectedVehicle, fitAllVehicles],
  );

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

  // RC9: derive headings DURING render (was a post-commit effect that left the value
  // one socket-tick stale) so a marker's rotation matches the same positions it's
  // rendered at. The bearing / shortest-delta math (RC3/RC4) is unchanged — only the
  // timing is. Previous positions + the accumulated angle are advanced post-commit in
  // the effect below, keeping ref writes out of render.
  /* eslint-disable react-hooks/refs -- render-time read of prev-render refs; advanced post-commit below */
  const headings = useMemo(() => {
    const next: Record<string, number> = {};

    for (const vehicle of vehicles) {
      const current = headingsRef.current[vehicle.id];

      if (!isValidCoordinate(vehicle.latitude, vehicle.longitude)) {
        if (current !== undefined) next[vehicle.id] = current;
        continue;
      }

      const prev = prevPositionsRef.current[vehicle.id];

      if (prev) {
        const dist = haversineDistance(
          prev.lat,
          prev.lng,
          vehicle.latitude,
          vehicle.longitude,
        );

        // RC3: only update heading when genuinely moving (not idle / GPS jitter),
        // so a stationary truck keeps its last heading.
        if (
          vehicle.speed > MIN_MOVING_SPEED_KMH &&
          dist >= MIN_HEADING_DISTANCE_M
        ) {
          const bearing = calculateBearing(
            prev.lat,
            prev.lng,
            vehicle.latitude,
            vehicle.longitude,
          );

          // RC4: accumulate a continuous (unwrapped) angle via the shortest signed
          // delta, so the rotate transition always turns the short way.
          next[vehicle.id] =
            current === undefined
              ? bearing
              : current + shortestAngleDelta(current, bearing);
          continue;
        }
      }

      // Not moving / no previous fix → keep the last heading.
      if (current !== undefined) next[vehicle.id] = current;
    }

    return next;
  }, [vehicles]);
  /* eslint-enable react-hooks/refs */

  // Advance the accumulator + previous positions AFTER commit, so the next render's
  // derive above sees this tick's values. Vehicles that vanished drop out naturally.
  useEffect(() => {
    headingsRef.current = headings;

    const nextPrev: Record<string, { lat: number; lng: number }> = {};
    for (const vehicle of vehicles) {
      if (isValidCoordinate(vehicle.latitude, vehicle.longitude)) {
        nextPrev[vehicle.id] = {
          lat: vehicle.latitude,
          lng: vehicle.longitude,
        };
      } else {
        const kept = prevPositionsRef.current[vehicle.id];
        if (kept) nextPrev[vehicle.id] = kept;
      }
    }
    prevPositionsRef.current = nextPrev;
  }, [vehicles, headings]);

  const handleDragStart = useCallback(() => {
    setInternalFollowMode(false);
  }, []);

  // Which vehicle the popup card is open FOR — deliberately separate from which vehicle is
  // selected. Selection is owned by the page (the list sets it too); the card is a
  // map-local concern that only a marker click opens. Keeping them apart is what lets the
  // card close without disturbing the selection, and stops a list selection from popping
  // the card open. Storing the id (not a boolean) also means picking a different vehicle
  // from the list hides a stale card for free — no extra effect to keep them in sync.
  const [cardVehicleId, setCardVehicleId] = useState<string | null>(null);
  const cardOpen = cardVehicleId !== null && cardVehicleId === selectedVehicle?.id;

  // A marker click also reaches the map's own click handler in some builds, which would
  // close the card in the same tick it was opened. Recording the marker click and ignoring
  // a map click that lands right behind it makes the order irrelevant.
  const lastMarkerClickRef = useRef(0);

  // The ONLY thing that opens the card. It still selects too, so clicking an unselected
  // marker both focuses that vehicle and shows its details in one action.
  const handleMarkerClick = useCallback(
    (vehicle: Vehicle) => {
      lastMarkerClickRef.current = performance.now();
      onVehicleSelect?.(vehicle);
      setCardVehicleId(vehicle.id);
    },
    [onVehicleSelect],
  );

  // Clicking empty map dismisses the card ONLY. It used to call onVehicleSelect(null),
  // which cleared the selection and sent the map back to fitAllVehicles — the selected
  // vehicle must survive both this and the card's own close button. "Show all" stays an
  // explicit action via the vehicle list.
  const handleMapClick = useCallback(() => {
    if (performance.now() - lastMarkerClickRef.current < 300) return;
    setCardVehicleId(null);
  }, []);

  if (loadError || authFailed) {
    return (
      <div className="relative h-full min-h-[300px] md:min-h-[350px] w-full overflow-hidden flex flex-col items-center justify-center gap-3 bg-muted px-6 text-center">
        <p className="text-sm font-medium text-foreground">
          Unable to load the map
        </p>
        <p className="text-xs text-muted-foreground">
          {authFailed
            ? "The map could not be authorized for this site."
            : "Check your internet connection and try again."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-1 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-all cursor-pointer shadow-sm outline-none"
        >
          Retry
        </button>
      </div>
    );
  }

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
      <div className="absolute right-4 top-4 z-[40] flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 shadow-sm border border-border">
        <span className="h-2 w-2 rounded-full bg-success" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
          Live Tracking
        </span>
      </div>

      {/* STATUS CARD */}
      <LiveStatusCard vehicles={vehicles} />

      {/* MAP CONTROLS (outside GoogleMap so they remain above the map) */}
      <MapControls
        onLocate={() => setLocalCenterTrigger((prev) => prev + 1)}
        followMode={followMode}
        onToggleFollow={() => setInternalFollowMode((v) => !v)}
        mapRef={mapRef}
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
        onClick={handleMapClick}
      >
        {/* VEHICLE MARKERS — gated on mapReady (tilesloaded) so they are only ever
            created against an authorized, fully-rendered map. Selecting a vehicle used
            to filter this list down to the selection alone; every marker now stays drawn
            so a second marker is there to click when switching vehicles. The selection
            reads through z-index (SELECTED_Z_INDEX) and the popup card below. */}
        {map &&
          mapReady &&
          validVehicles.map((vehicle) => {
            const heading = headings[vehicle.id] ?? 0;

            return (
              <VehicleMarker
                key={vehicle.id}
                map={map}
                vehicle={vehicle}
                heading={heading}
                isSelected={selectedVehicle?.id === vehicle.id}
                onClick={() => handleMarkerClick(vehicle)}
              />
            );
          })}

        {/* SELECTED-VEHICLE POPUP — anchored to the marker's own LatLng, so OverlayView
            keeps it glued to the vehicle through pan, zoom and live position updates
            rather than to a fixed screen corner. Gated on `cardOpen`, NOT on
            `selectedVehicle` alone: a vehicle picked from the list is selected and
            focused, but shows no card until its marker is clicked. */}
        {showVehicleCard &&
          cardOpen &&
          mapReady &&
          selectedVehicle &&
          isValidCoordinate(
            selectedVehicle.latitude,
            selectedVehicle.longitude,
          ) && (
            <OverlayViewF
              position={{
                lat: selectedVehicle.latitude,
                lng: selectedVehicle.longitude,
              }}
              mapPaneName={FLOAT_PANE}
              // Centre the card on the marker and lift it clear of the 40px icon.
              getPixelPositionOffset={(width, height) => ({
                x: -(width / 2),
                y: -height - 30,
              })}
            >
              <VehiclePopupCard
                vehicle={selectedVehicle}
                onCenterMap={() => setLocalCenterTrigger((prev) => prev + 1)}
                // Closes the card and NOTHING else — the vehicle stays selected and the
                // map stays focused on it. This used to clear the selection, which is
                // what snapped the map back to the all-vehicles view.
                onClose={() => setCardVehicleId(null)}
              />
            </OverlayViewF>
          )}
      </GoogleMap>
    </div>
  );
}
