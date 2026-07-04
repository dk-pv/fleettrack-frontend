/**
 * Trip domain contract (API-shaped).
 *
 * These interfaces mirror the JSON the future NestJS + Prisma REST API will return,
 * so the mock data and the service layer can be swapped for real HTTP calls with no
 * changes to consumers. Keep field names aligned with the planned Prisma model.
 */

/* ------------------------------------------------------------------ */
/* Roles & permissions                                                 */
/* ------------------------------------------------------------------ */

export type UserRole = "ADMIN" | "CLIENT" | "VIEWER";

/**
 * Capability flags for the trip module.
 *
 * Business rule: the CLIENT owns trip management (create / edit / delete /
 * lifecycle); the ADMIN is read-only (monitors all clients & trips). This is the
 * inverse of the vehicles convention, so it is declared explicitly here rather
 * than inferred at each call site.
 */
export interface TripPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageLifecycle: boolean;
}

export function getTripPermissions(role: UserRole | undefined): TripPermissions {
  const isClient = role === "CLIENT";
  const isAdmin = role === "ADMIN";

  return {
    canView: isAdmin || isClient,
    canCreate: isClient,
    canEdit: isClient,
    canDelete: isClient,
    canManageLifecycle: isClient,
  };
}

/* ------------------------------------------------------------------ */
/* Trip lifecycle                                                      */
/* ------------------------------------------------------------------ */

export enum TripStatus {
  PLANNED = "PLANNED",
  ASSIGNED = "ASSIGNED",
  STARTED = "STARTED",
  ONGOING = "ONGOING",
  DELAYED = "DELAYED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/** All statuses, in lifecycle order — handy for filter dropdowns. */
export const TRIP_STATUSES: TripStatus[] = [
  TripStatus.PLANNED,
  TripStatus.ASSIGNED,
  TripStatus.STARTED,
  TripStatus.ONGOING,
  TripStatus.DELAYED,
  TripStatus.COMPLETED,
  TripStatus.CANCELLED,
];

/**
 * Lifecycle state machine (TM-12.1): allowed next statuses per current status.
 * CANCELLED is reachable from any active state; COMPLETED and CANCELLED are terminal.
 */
export const TRIP_STATUS_TRANSITIONS: Record<TripStatus, TripStatus[]> = {
  [TripStatus.PLANNED]: [TripStatus.ASSIGNED, TripStatus.CANCELLED],
  [TripStatus.ASSIGNED]: [TripStatus.STARTED, TripStatus.CANCELLED],
  [TripStatus.STARTED]: [
    TripStatus.ONGOING,
    TripStatus.DELAYED,
    TripStatus.CANCELLED,
  ],
  [TripStatus.ONGOING]: [
    TripStatus.DELAYED,
    TripStatus.COMPLETED,
    TripStatus.CANCELLED,
  ],
  [TripStatus.DELAYED]: [
    TripStatus.ONGOING,
    TripStatus.COMPLETED,
    TripStatus.CANCELLED,
  ],
  [TripStatus.COMPLETED]: [],
  [TripStatus.CANCELLED]: [],
};

export function getNextStatuses(status: TripStatus): TripStatus[] {
  return TRIP_STATUS_TRANSITIONS[status];
}

export function canTransition(from: TripStatus, to: TripStatus): boolean {
  return TRIP_STATUS_TRANSITIONS[from].includes(to);
}

/* ------------------------------------------------------------------ */
/* Entities (as embedded in a Trip response)                           */
/* ------------------------------------------------------------------ */

export interface TripClient {
  id: string;
  name: string;
}

export interface TripVehicle {
  id: string;
  vehicleNumber: string;
  vehicleName?: string;
}

export interface TripDriver {
  id: string;
  name: string;
}

/** Reference data for the trip creation form (assignable vehicles & drivers). */
export interface TripFormOptions {
  vehicles: TripVehicle[];
  drivers: TripDriver[];
}

/** Maximum number of intermediate stops allowed on a trip. */
export const MAX_TRIP_STOPS = 10;

/** An ordered intermediate stop between a trip's origin and destination. */
export interface TripStop {
  id: string;
  address: string;
  /** 1-based order among the trip's stops. */
  sequence: number;
  /** Resolved via geocoding at creation (optional for legacy/mock trips). */
  coords?: GeoPoint;
}

/** Stop input on create (order = array order; the API assigns id + sequence). */
export interface CreateTripStopInput {
  address: string;
}

/** A geographic coordinate (WGS84). */
export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Trip {
  id: string;
  reference: string;
  status: TripStatus;

  /* Owner (client that manages the trip) */
  clientId: string;
  client: TripClient;

  /* Assignment (nullable until the client assigns them) */
  vehicleId: string | null;
  vehicle: TripVehicle | null;
  driverId: string | null;
  driverName: string | null;

  /* Route */
  origin: string;
  originCoords?: GeoPoint;
  destination: string;
  destinationCoords?: GeoPoint;
  /** Ordered intermediate stops between origin and destination (max 10). */
  stops: TripStop[];
  distanceKm: number;
  durationMins: number;

  /* Optional free-text notes */
  notes: string | null;

  /* Timeline — ISO 8601 strings, as the API serialises dates */
  scheduledStart: string;
  scheduledEnd: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Write payloads (DTOs)                                               */
/* ------------------------------------------------------------------ */

export interface CreateTripDto {
  /** Server may auto-generate; optional on the client. */
  reference?: string;
  /** Implicit (own) for a CLIENT; explicit for API shape. */
  clientId: string;
  vehicleId?: string | null;
  driverId?: string | null;
  driverName?: string | null;
  origin: string;
  destination: string;
  stops?: CreateTripStopInput[];
  distanceKm?: number;
  durationMins?: number;
  scheduledStart: string;
  scheduledEnd: string;
  notes?: string;
}

export type UpdateTripDto = Partial<CreateTripDto>;

export interface UpdateTripStatusDto {
  status: TripStatus;
}

/* ------------------------------------------------------------------ */
/* Response envelopes (match existing `data.vehicles` / `data.clients`)*/
/* ------------------------------------------------------------------ */

export interface TripsResponse {
  trips: Trip[];
}

export interface TripResponse {
  trip: Trip;
}

/* ------------------------------------------------------------------ */
/* Timeline (lifecycle events)                                         */
/* ------------------------------------------------------------------ */

export interface TripEvent {
  id: string;
  tripId: string;
  status: TripStatus;
  note: string | null;
  timestamp: string;
}

export interface TripTimelineResponse {
  events: TripEvent[];
}

/* ------------------------------------------------------------------ */
/* Route (geocoded preview)                                            */
/* ------------------------------------------------------------------ */

export type RoutePointType = "pickup" | "stop" | "destination";

export interface RoutePoint {
  type: RoutePointType;
  label: string;
  sequence: number | null;
  coords: GeoPoint;
}

export interface TripRouteResponse {
  points: RoutePoint[];
}

/* ------------------------------------------------------------------ */
/* Progress & distance metrics                                         */
/* ------------------------------------------------------------------ */

export interface TripProgress {
  totalMeters: number;
  coveredMeters: number;
  remainingMeters: number;
  /** 0–100, derived from covered / total. */
  percentage: number;
  /** False when the assigned vehicle has no usable live position. */
  hasVehiclePosition: boolean;
}

export interface TripProgressResponse {
  progress: TripProgress;
  vehiclePosition: GeoPoint | null;
}
