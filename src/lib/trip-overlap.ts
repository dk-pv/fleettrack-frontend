import { OverlapConflict, Trip, TripStatus } from "@/types/trip";

/**
 * Trip double-booking detection (pure).
 *
 * A vehicle — or a driver — may not run two trips whose schedules overlap.
 * COMPLETED and CANCELLED trips have released the resource, so they never block a
 * new booking. Kept framework-free so the UI hook, the service, and (later) the
 * real API guard all share one algorithm.
 */

/** Statuses whose trips no longer reserve the vehicle/driver. */
const RELEASING_STATUSES: TripStatus[] = [
  TripStatus.COMPLETED,
  TripStatus.CANCELLED,
];

/**
 * Half-open interval overlap: [aStart, aEnd) vs [bStart, bEnd). Times are epoch
 * millis. Touching edges (one ends exactly when the next starts) do NOT overlap.
 */
export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Which trip assignment the conflict check keys on. */
type OverlapResource = "vehicleId" | "driverId";

function toConflict(trip: Trip): OverlapConflict {
  return {
    tripId: trip.id,
    reference: trip.reference,
    scheduledStart: trip.scheduledStart,
    scheduledEnd: trip.scheduledEnd,
    status: trip.status,
  };
}

/** Core: existing active trips that book `resourceId` during the candidate window. */
function findConflicts(
  trips: Trip[],
  resource: OverlapResource,
  candidate: {
    resourceId: string | null | undefined;
    scheduledStart: string;
    scheduledEnd: string;
    excludeTripId?: string;
  },
): OverlapConflict[] {
  const start = new Date(candidate.scheduledStart).getTime();
  const end = new Date(candidate.scheduledEnd).getTime();

  if (!candidate.resourceId || Number.isNaN(start) || Number.isNaN(end)) {
    return [];
  }

  return trips
    .filter(
      (trip) =>
        trip[resource] === candidate.resourceId &&
        trip.id !== candidate.excludeTripId &&
        !RELEASING_STATUSES.includes(trip.status) &&
        intervalsOverlap(
          start,
          end,
          new Date(trip.scheduledStart).getTime(),
          new Date(trip.scheduledEnd).getTime(),
        ),
    )
    .map(toConflict);
}

export interface OverlapCandidate {
  vehicleId: string;
  scheduledStart: string;
  scheduledEnd: string;
  /** Exclude this trip from the check (when editing an existing trip). */
  excludeTripId?: string;
}

/** Existing trips that double-book `candidate.vehicleId` for its schedule. */
export function findVehicleConflicts(
  trips: Trip[],
  candidate: OverlapCandidate,
): OverlapConflict[] {
  return findConflicts(trips, "vehicleId", {
    resourceId: candidate.vehicleId,
    scheduledStart: candidate.scheduledStart,
    scheduledEnd: candidate.scheduledEnd,
    excludeTripId: candidate.excludeTripId,
  });
}

export interface DriverOverlapCandidate {
  driverId: string;
  scheduledStart: string;
  scheduledEnd: string;
  /** Exclude this trip from the check (when editing an existing trip). */
  excludeTripId?: string;
}

/** Existing trips that double-book `candidate.driverId` for its schedule. */
export function findDriverConflicts(
  trips: Trip[],
  candidate: DriverOverlapCandidate,
): OverlapConflict[] {
  return findConflicts(trips, "driverId", {
    resourceId: candidate.driverId,
    scheduledStart: candidate.scheduledStart,
    scheduledEnd: candidate.scheduledEnd,
    excludeTripId: candidate.excludeTripId,
  });
}
