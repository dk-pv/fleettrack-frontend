import { apiFetch } from "@/lib/fetcher";
import { isValidCoordinate } from "@/lib/gps-utils";
import { GeoPoint, TripVehicle } from "@/types/trip";

/**
 * Shared vehicle fetch for the FleetTrack API.
 *
 * The backend scopes `/vehicles` to the authenticated user via the JWT, so a
 * CLIENT receives only their own vehicles — no clientId argument needed. This
 * centralises the fetch so trip creation reuses it instead of duplicating the
 * inline `apiFetch("/vehicles")` calls in the vehicles/tracking pages.
 */

interface ApiVehicle {
  id: string;
  vehicleNumber: string;
  vehicleName: string;
}

export async function getVehicles(): Promise<TripVehicle[]> {
  const response = await apiFetch("/vehicles");
  const data = await response.json();
  const vehicles: ApiVehicle[] = data.vehicles ?? [];

  return vehicles.map((vehicle) => ({
    id: vehicle.id,
    vehicleNumber: vehicle.vehicleNumber,
    vehicleName: vehicle.vehicleName,
  }));
}

/**
 * Normalise a raw vehicle record's coordinates to a GeoPoint, or null if the
 * position is missing/invalid. Pure and synchronous so it is reused for both the
 * REST snapshot below and the live socket feed (see trip.service).
 */
export function toVehiclePosition(
  vehicle: { latitude?: unknown; longitude?: unknown } | null | undefined,
): GeoPoint | null {
  if (
    !vehicle ||
    typeof vehicle.latitude !== "number" ||
    typeof vehicle.longitude !== "number" ||
    !isValidCoordinate(vehicle.latitude, vehicle.longitude)
  ) {
    return null;
  }

  return { lat: vehicle.latitude, lng: vehicle.longitude };
}

/** Current live position of a vehicle (snapshot); null if unknown/invalid. */
export async function getVehiclePosition(
  vehicleId: string,
): Promise<GeoPoint | null> {
  const response = await apiFetch(`/vehicles/${vehicleId}`);
  const data = await response.json();
  return toVehiclePosition(data.vehicle);
}
