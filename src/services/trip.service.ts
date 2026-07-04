import {
  CreateTripDto,
  GeoPoint,
  MAX_TRIP_STOPS,
  RoutePoint,
  ROUTE_DEVIATION_THRESHOLD_M,
  Trip,
  TripEvent,
  TripFormOptions,
  TripResponse,
  TripRouteResponse,
  TripsResponse,
  TripProgressResponse,
  TripStatus,
  TripTimelineResponse,
  TripVehicle,
  UpdateTripDto,
  VehicleOverlapResponse,
  DriverOverlapResponse,
} from "@/types/trip";
import { mockDrivers, mockTrips } from "@/lib/mock/trips.mock";
import { mockGeocode } from "@/lib/mock/geocode.mock";
import {
  getVehicles,
  getVehiclePosition,
  toVehiclePosition,
} from "@/services/vehicle.service";
import { computeRouteProgress } from "@/lib/route-progress";
import {
  findVehicleConflicts,
  findDriverConflicts,
  OverlapCandidate,
  DriverOverlapCandidate,
} from "@/lib/trip-overlap";

/**
 * Trip service — the ONLY module that touches trip data.
 *
 * Phase 2 is frontend-first: these functions read/mutate an in-memory copy of the
 * mock data. Their signatures and return types are already API-shaped, so switching
 * to the real backend later means replacing each function BODY with an `apiFetch(...)`
 * call (see the commented reference under each function) — no consumer changes.
 *
 *   Future API (NestJS):
 *     GET    /trips            -> { trips }
 *     GET    /trips/:id        -> { trip }
 *     POST   /trips            -> { trip }
 *     PATCH  /trips/:id        -> { trip }
 *     PATCH  /trips/:id/status -> { trip }
 *     DELETE /trips/:id        -> { success }
 */

/* In-memory store (seeded from the mock). Replaced by the API in a later phase. */
let trips: Trip[] = mockTrips.map((trip) => ({ ...trip }));

/* Simulate network latency so loading states are exercised in the UI. */
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = (trip: Trip): Trip => ({ ...trip });

function findTrip(id: string): Trip {
  const trip = trips.find((t) => t.id === id);
  if (!trip) {
    throw new Error(`Trip not found: ${id}`);
  }
  return trip;
}

/* Timeline — in-memory event log per trip; seeded lazily, appended on transition. */
const timelines: Record<string, TripEvent[]> = {};

const STATUS_NOTE: Record<TripStatus, string> = {
  [TripStatus.PLANNED]: "Trip created",
  [TripStatus.ASSIGNED]: "Vehicle & driver assigned",
  [TripStatus.STARTED]: "Trip started",
  [TripStatus.ONGOING]: "In transit",
  [TripStatus.DELAYED]: "Trip delayed",
  [TripStatus.COMPLETED]: "Trip completed",
  [TripStatus.CANCELLED]: "Trip cancelled",
};

function makeEvent(
  tripId: string,
  status: TripStatus,
  timestamp: string,
): TripEvent {
  return {
    id: `evt-${crypto.randomUUID()}`,
    tripId,
    status,
    note: STATUS_NOTE[status],
    timestamp,
  };
}

/** Derive a dummy starting timeline from a trip's known timestamps. */
function buildInitialTimeline(trip: Trip): TripEvent[] {
  const events: TripEvent[] = [
    makeEvent(trip.id, TripStatus.PLANNED, trip.createdAt),
  ];

  if (trip.vehicleId) {
    events.push(makeEvent(trip.id, TripStatus.ASSIGNED, trip.createdAt));
  }
  if (trip.startedAt) {
    events.push(makeEvent(trip.id, TripStatus.STARTED, trip.startedAt));
  }
  if (
    trip.status === TripStatus.ONGOING ||
    trip.status === TripStatus.DELAYED
  ) {
    events.push(
      makeEvent(trip.id, trip.status, trip.startedAt ?? trip.scheduledStart),
    );
  }
  if (trip.completedAt) {
    events.push(makeEvent(trip.id, TripStatus.COMPLETED, trip.completedAt));
  }
  if (trip.status === TripStatus.CANCELLED) {
    events.push(makeEvent(trip.id, TripStatus.CANCELLED, trip.updatedAt));
  }

  return events;
}

function ensureTimeline(trip: Trip): TripEvent[] {
  if (!timelines[trip.id]) {
    timelines[trip.id] = buildInitialTimeline(trip);
  }
  return timelines[trip.id];
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/**
 * List trips. When `clientId` is provided the result is scoped to that client
 * (this is how ADMIN filtering and CLIENT self-scoping both work).
 */
export async function getTrips(clientId?: string): Promise<TripsResponse> {
  await delay();

  // Future: const query = clientId ? `?clientId=${clientId}` : "";
  //         const res = await apiFetch(`/trips${query}`); return res.json();
  const scoped = clientId
    ? trips.filter((trip) => trip.clientId === clientId)
    : trips;

  return { trips: scoped.map(clone) };
}

export async function getTrip(id: string): Promise<TripResponse> {
  await delay();

  // Future: const res = await apiFetch(`/trips/${id}`); return res.json();
  return { trip: clone(findTrip(id)) };
}

/**
 * Vehicle availability check for double-booking (TM-09.1). Returns the existing
 * trips that clash with a candidate vehicle + schedule; empty when the vehicle is
 * free. COMPLETED/CANCELLED trips never block (see findVehicleConflicts).
 *
 *   Future API: GET /trips/overlap?vehicleId=&start=&end=&excludeTripId=
 */
export async function checkVehicleOverlap(
  candidate: OverlapCandidate,
): Promise<VehicleOverlapResponse> {
  await delay();

  const conflicts = findVehicleConflicts(trips, candidate);
  return { hasOverlap: conflicts.length > 0, conflicts };
}

/**
 * Driver availability check for double-booking (TM-10.1). Returns the existing
 * trips that clash with a candidate driver + schedule; empty when the driver is
 * free. COMPLETED/CANCELLED trips never block (see findDriverConflicts).
 *
 *   Future API: GET /trips/overlap?driverId=&start=&end=&excludeTripId=
 */
export async function checkDriverOverlap(
  candidate: DriverOverlapCandidate,
): Promise<DriverOverlapResponse> {
  await delay();

  const conflicts = findDriverConflicts(trips, candidate);
  return { hasOverlap: conflicts.length > 0, conflicts };
}

/* ------------------------------------------------------------------ */
/* Writes (CLIENT only — enforced in the UI now, on the API later)     */
/* ------------------------------------------------------------------ */

export async function createTrip(dto: CreateTripDto): Promise<TripResponse> {
  await delay();

  // Future: const res = await apiFetch("/trips", { method: "POST", body: JSON.stringify(dto) }); return res.json();

  // Reject double-booking of the vehicle or driver (the real API enforces this
  // server-side).
  if (dto.vehicleId) {
    const conflicts = findVehicleConflicts(trips, {
      vehicleId: dto.vehicleId,
      scheduledStart: dto.scheduledStart,
      scheduledEnd: dto.scheduledEnd,
    });
    if (conflicts.length > 0) {
      throw new Error("VEHICLE_OVERLAP");
    }
  }

  if (dto.driverId) {
    const conflicts = findDriverConflicts(trips, {
      driverId: dto.driverId,
      scheduledStart: dto.scheduledStart,
      scheduledEnd: dto.scheduledEnd,
    });
    if (conflicts.length > 0) {
      throw new Error("DRIVER_OVERLAP");
    }
  }

  const now = new Date().toISOString();
  const existingForClient = trips.filter((t) => t.clientId === dto.clientId);

  // Resolve the nested vehicle from the real vehicles API (server does this for real).
  let vehicle: TripVehicle | null = null;
  if (dto.vehicleId) {
    try {
      const vehicles = await getVehicles();
      vehicle = vehicles.find((v) => v.id === dto.vehicleId) ?? null;
    } catch {
      vehicle = null;
    }
  }

  const trip: Trip = {
    id: `trip-${crypto.randomUUID()}`,
    reference: dto.reference ?? `TRIP-2026-${String(3000 + trips.length + 1)}`,
    status: TripStatus.PLANNED,
    clientId: dto.clientId,
    client: {
      id: dto.clientId,
      // Reuse a known name for this client if we have one; API supplies it for real.
      name: existingForClient[0]?.client.name ?? "Client",
    },
    vehicleId: dto.vehicleId ?? null,
    vehicle,
    driverId: dto.driverId ?? null,
    driverName: dto.driverName ?? null,
    origin: dto.origin,
    originCoords: mockGeocode(dto.origin),
    destination: dto.destination,
    destinationCoords: mockGeocode(dto.destination),
    stops: (dto.stops ?? []).slice(0, MAX_TRIP_STOPS).map((stop, i) => ({
      id: `stop-${crypto.randomUUID()}`,
      address: stop.address,
      sequence: i + 1,
      coords: mockGeocode(stop.address),
    })),
    distanceKm: dto.distanceKm ?? 0,
    durationMins: dto.durationMins ?? 0,
    notes: dto.notes ?? null,
    scheduledStart: dto.scheduledStart,
    scheduledEnd: dto.scheduledEnd,
    startedAt: null,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  trips = [trip, ...trips];
  timelines[trip.id] = [makeEvent(trip.id, TripStatus.PLANNED, now)];
  return { trip: clone(trip) };
}

/** Reference data for the trip creation form: real vehicles + (mock) drivers. */
export async function getTripFormOptions(): Promise<TripFormOptions> {
  // Vehicles come from the real FleetTrack API (scoped to the client by the JWT).
  // Drivers stay mock until a drivers endpoint exists.
  const vehicles = await getVehicles();

  return {
    vehicles,
    drivers: mockDrivers.map((d) => ({ ...d })),
  };
}

export async function updateTrip(
  id: string,
  dto: UpdateTripDto,
): Promise<TripResponse> {
  await delay();

  // Future: const res = await apiFetch(`/trips/${id}`, { method: "PATCH", body: JSON.stringify(dto) }); return res.json();
  const current = findTrip(id);

  const updated: Trip = {
    ...current,
    ...dto,
    // Never let a partial DTO overwrite server-owned/derived fields.
    id: current.id,
    client: current.client,
    clientId: dto.clientId ?? current.clientId,
    vehicleId: dto.vehicleId ?? current.vehicleId,
    driverId: dto.driverId ?? current.driverId,
    driverName: dto.driverName ?? current.driverName,
    // Stops are managed at creation time; preserve them across generic updates.
    stops: current.stops,
    updatedAt: new Date().toISOString(),
  };

  trips = trips.map((trip) => (trip.id === id ? updated : trip));
  return { trip: clone(updated) };
}

export async function updateTripStatus(
  id: string,
  status: TripStatus,
): Promise<TripResponse> {
  await delay();

  // Future: const res = await apiFetch(`/trips/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); return res.json();
  const current = findTrip(id);
  const now = new Date().toISOString();

  const startsNow =
    status === TripStatus.STARTED || status === TripStatus.ONGOING;

  const updated: Trip = {
    ...current,
    status,
    startedAt: startsNow && !current.startedAt ? now : current.startedAt,
    completedAt: status === TripStatus.COMPLETED ? now : current.completedAt,
    updatedAt: now,
  };

  ensureTimeline(current).push(makeEvent(id, status, now));

  trips = trips.map((trip) => (trip.id === id ? updated : trip));
  return { trip: clone(updated) };
}

export async function deleteTrip(id: string): Promise<{ success: boolean }> {
  await delay();

  // Future: await apiFetch(`/trips/${id}`, { method: "DELETE" }); return { success: true };
  trips = trips.filter((trip) => trip.id !== id);
  delete timelines[id];
  return { success: true };
}

/** Lifecycle timeline for a single trip. */
export async function getTripTimeline(
  tripId: string,
): Promise<TripTimelineResponse> {
  await delay();

  // Future: const res = await apiFetch(`/trips/${tripId}/timeline`); return res.json();
  const trip = findTrip(tripId);
  const events = ensureTimeline(trip);
  return { events: events.map((e) => ({ ...e })) };
}

/* ------------------------------------------------------------------ */
/* Geocoding & route (mock — swap for the Google Geocoding API later)  */
/* ------------------------------------------------------------------ */

export async function geocodeAddress(address: string): Promise<GeoPoint> {
  await delay();
  return mockGeocode(address);
}

/** Build ordered route points (pickup → stops → destination), geocoding as needed. */
function toRoutePoints(input: {
  origin: string;
  originCoords?: GeoPoint;
  destination: string;
  destinationCoords?: GeoPoint;
  stops: { address: string; sequence: number; coords?: GeoPoint }[];
}): RoutePoint[] {
  const points: RoutePoint[] = [
    {
      type: "pickup",
      label: input.origin,
      sequence: null,
      coords: input.originCoords ?? mockGeocode(input.origin),
    },
  ];

  input.stops.forEach((stop) => {
    points.push({
      type: "stop",
      label: stop.address,
      sequence: stop.sequence,
      coords: stop.coords ?? mockGeocode(stop.address),
    });
  });

  points.push({
    type: "destination",
    label: input.destination,
    sequence: null,
    coords: input.destinationCoords ?? mockGeocode(input.destination),
  });

  return points;
}

/** Geocoded, ordered route for a stored trip. */
export async function getTripRoute(tripId: string): Promise<TripRouteResponse> {
  await delay();
  const trip = findTrip(tripId);

  return {
    points: toRoutePoints({
      origin: trip.origin,
      originCoords: trip.originCoords,
      destination: trip.destination,
      destinationCoords: trip.destinationCoords,
      stops: trip.stops.map((s) => ({
        address: s.address,
        sequence: s.sequence,
        coords: s.coords,
      })),
    }),
  };
}

/** Geocode draft addresses for a live route preview in the creation modal. */
export async function previewTripRoute(input: {
  origin: string;
  destination: string;
  stops: string[];
}): Promise<TripRouteResponse> {
  await delay();

  return {
    points: toRoutePoints({
      origin: input.origin,
      destination: input.destination,
      stops: input.stops.map((address, i) => ({ address, sequence: i + 1 })),
    }),
  };
}

/**
 * Assemble progress metrics from an ordered route + a (possibly null) live
 * position. Pure and synchronous so the live socket feed can recompute on each
 * update without re-geocoding or re-fetching (see progressFromVehicle / use-trip).
 */
export function buildTripProgress(
  points: RoutePoint[],
  position: GeoPoint | null,
): TripProgressResponse {
  const progress = computeRouteProgress(
    points.map((point) => point.coords),
    position,
  );

  const hasVehiclePosition = position !== null;

  return {
    progress: {
      ...progress,
      hasVehiclePosition,
      isDeviating:
        hasVehiclePosition &&
        progress.deviationMeters > ROUTE_DEVIATION_THRESHOLD_M,
    },
    vehiclePosition: position,
  };
}

/**
 * Recompute progress from a raw live vehicle payload (the tracking socket feed).
 * Reuses vehicle.service's coordinate extraction — no duplicated GPS logic.
 */
export function progressFromVehicle(
  points: RoutePoint[],
  vehicle: { latitude?: unknown; longitude?: unknown } | null,
): TripProgressResponse {
  return buildTripProgress(points, toVehiclePosition(vehicle));
}

/** Route progress + distance metrics from the assigned vehicle's live position. */
export async function getTripProgress(
  tripId: string,
): Promise<TripProgressResponse> {
  const trip = findTrip(tripId);

  const points = toRoutePoints({
    origin: trip.origin,
    originCoords: trip.originCoords,
    destination: trip.destination,
    destinationCoords: trip.destinationCoords,
    stops: trip.stops.map((s) => ({
      address: s.address,
      sequence: s.sequence,
      coords: s.coords,
    })),
  });

  let vehiclePosition: GeoPoint | null = null;
  if (trip.vehicleId) {
    try {
      vehiclePosition = await getVehiclePosition(trip.vehicleId);
    } catch {
      vehiclePosition = null;
    }
  }

  return buildTripProgress(points, vehiclePosition);
}
