/**
 * Trip Request service.
 *
 * DUMMY implementation for the frontend-first phase: it operates on an in-memory store
 * seeded from local data and makes NO backend calls. The hook/UI never learn whether the
 * data is dummy or real — later the internals of these functions swap to `apiFetch(...)`
 * (POST/GET /trip-requests, PATCH /trip-requests/:id/approve|reject) with the SAME
 * signatures, and nothing above this file changes.
 *
 *   Trip Request UI → use-trip-requests → trip-request.service → dummy data   (now)
 *   Trip Request UI → use-trip-requests → trip-request.service → NestJS API    (later)
 */

import type { CreateTripDto } from "@/types/trip";
import type { UserRole } from "@/types/user";
import { TripRequest, TripRequestStatus } from "@/types/trip-request";
import {
  tripRequestSeed,
  CURRENT_DUMMY_CLIENT,
  DUMMY_REVIEWER,
} from "@/data/trip-requests";

// Session store: a clone of the seed so approve/reject/create persist within a browser
// session and reset on reload — appropriate for a demo data layer.
let store: TripRequest[] = tripRequestSeed.map((r) => ({ ...r }));

// Small artificial latency so the real loading/skeleton states are exercised.
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const nowIso = () => new Date().toISOString();

let localSeq = 1;
const nextLocalId = () => `req-local-${localSeq++}`;

/** List requests scoped like the future API: ADMIN sees all, CLIENT sees only its own. */
export async function getTripRequests(role: UserRole): Promise<TripRequest[]> {
  await delay();
  const rows =
    role === "ADMIN"
      ? store
      : store.filter((r) => r.clientId === CURRENT_DUMMY_CLIENT.id);
  return [...rows].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** A single request by id (ownership scoping is applied in the list; detail reuses it). */
export async function getTripRequest(id: string): Promise<TripRequest | null> {
  await delay();
  const found = store.find((r) => r.id === id);
  return found ? { ...found } : null;
}

/**
 * Create a PENDING request from the existing trip-form payload. Dummy: attaches it to the
 * demo client and prepends it to the store — NO POST to the backend. (Wired to the CLIENT
 * form during integration, when the form's vehicle/driver options come from the real API.)
 */
export async function createTripRequest(
  dto: CreateTripDto,
): Promise<TripRequest> {
  await delay();
  const id = nextLocalId();
  const ts = nowIso();
  const request: TripRequest = {
    id,
    status: TripRequestStatus.PENDING,
    clientId: CURRENT_DUMMY_CLIENT.id,
    client: CURRENT_DUMMY_CLIENT,
    reference: dto.reference?.trim() || null,
    vehicleId: dto.vehicleId ?? null,
    vehicle: null,
    driverId: dto.driverId ?? null,
    driverName: dto.driverName ?? null,
    customerId: dto.customerId ?? null,
    customer: null,
    origin: dto.origin,
    destination: dto.destination,
    originLat: null,
    originLng: null,
    destinationLat: null,
    destinationLng: null,
    stops: (dto.stops ?? []).map((s) => ({ address: s.address })),
    distanceKm: dto.distanceKm ?? null,
    durationMins: dto.durationMins ?? null,
    notes: dto.notes ?? null,
    scheduledStart: dto.scheduledStart,
    scheduledEnd: dto.scheduledEnd,
    tripId: null,
    trip: null,
    reviewedById: null,
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    createdAt: ts,
    updatedAt: ts,
  };
  store = [request, ...store];
  return { ...request };
}

/**
 * Approve a PENDING request. Dummy: simulates the Trip that approval would create
 * (tripId + reference) and stamps the reviewer/time. Only PENDING requests may be
 * approved — a second attempt throws, matching the backend guard.
 */
export async function approveTripRequest(id: string): Promise<TripRequest> {
  await delay();
  const req = store.find((r) => r.id === id);
  if (!req) throw new Error("Trip request not found");
  if (req.status !== TripRequestStatus.PENDING) {
    throw new Error("Only pending requests can be approved");
  }
  const ts = nowIso();
  const tripRef = req.reference ?? `TRIP-2026-${id.slice(-4).toUpperCase()}`;
  req.status = TripRequestStatus.APPROVED;
  req.tripId = `trip-${id}`;
  req.trip = { id: `trip-${id}`, reference: tripRef };
  req.reviewedById = DUMMY_REVIEWER.id;
  req.reviewedBy = DUMMY_REVIEWER;
  req.reviewedAt = ts;
  req.rejectionReason = null;
  req.updatedAt = ts;
  return { ...req };
}

/**
 * Reject a PENDING request with a reason. Dummy: stamps status/reviewer/time/reason and
 * creates no Trip. Only PENDING requests may be rejected.
 */
export async function rejectTripRequest(
  id: string,
  reason: string,
): Promise<TripRequest> {
  await delay();
  const req = store.find((r) => r.id === id);
  if (!req) throw new Error("Trip request not found");
  if (req.status !== TripRequestStatus.PENDING) {
    throw new Error("Only pending requests can be rejected");
  }
  const ts = nowIso();
  req.status = TripRequestStatus.REJECTED;
  req.reviewedById = DUMMY_REVIEWER.id;
  req.reviewedBy = DUMMY_REVIEWER;
  req.reviewedAt = ts;
  req.rejectionReason = reason.trim();
  req.updatedAt = ts;
  return { ...req };
}
