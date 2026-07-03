import { GeoPoint } from "@/types/trip";

/**
 * Mock geocoder — stands in for the Google Geocoding API until the backend exists.
 *
 * Imported ONLY by the service layer (never by components). Deterministic: known
 * Kerala places map to real-ish coordinates; unknown addresses hash to a stable
 * point inside a Kerala bounding box, so the same address always resolves the same.
 */

const KNOWN_PLACES: Record<string, GeoPoint> = {
  trivandrum: { lat: 8.5241, lng: 76.9366 },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  kollam: { lat: 8.8932, lng: 76.6141 },
  haripad: { lat: 9.2865, lng: 76.46 },
  alappuzha: { lat: 9.4981, lng: 76.3388 },
  kottayam: { lat: 9.5916, lng: 76.5222 },
  idukki: { lat: 9.8497, lng: 76.9681 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  ernakulam: { lat: 9.9816, lng: 76.2999 },
  thrissur: { lat: 10.5276, lng: 76.2144 },
  calicut: { lat: 11.2588, lng: 75.7804 },
  kozhikode: { lat: 11.2588, lng: 75.7804 },
  kannur: { lat: 11.8745, lng: 75.3704 },
};

const KERALA_BOUNDS = {
  minLat: 8.2,
  maxLat: 12.8,
  minLng: 74.8,
  maxLng: 77.4,
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // force 32-bit int
  }
  return Math.abs(hash);
}

/** Resolve an address string to coordinates (synchronous, deterministic). */
export function mockGeocode(address: string): GeoPoint {
  const key = address.trim().toLowerCase();

  if (KNOWN_PLACES[key]) {
    return { ...KNOWN_PLACES[key] };
  }

  const hash = hashString(key || "unknown");
  const latSpan = KERALA_BOUNDS.maxLat - KERALA_BOUNDS.minLat;
  const lngSpan = KERALA_BOUNDS.maxLng - KERALA_BOUNDS.minLng;

  const lat = KERALA_BOUNDS.minLat + ((hash % 1000) / 1000) * latSpan;
  const lng =
    KERALA_BOUNDS.minLng + ((Math.floor(hash / 1000) % 1000) / 1000) * lngSpan;

  return { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
}
