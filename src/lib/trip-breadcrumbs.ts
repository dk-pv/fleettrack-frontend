import { GeoPoint } from "@/types/trip";
import {
  haversineDistance,
  sortAndDedupeTrail,
  TrailPoint,
} from "@/lib/gps-utils";

/**
 * GPS breadcrumb history for route playback.
 *
 * Frontend-first: real breadcrumbs are recorded server-side from the GPS feed, so
 * here we synthesize an evenly-spaced trail along a completed trip's route. Reuses
 * the tracking `TrailPoint` shape and `haversineDistance` — no new GPS maths. The
 * future API returns the same `TrailPoint[]`, so it is a single-function swap.
 */

export interface TripBreadcrumbsResponse {
  breadcrumbs: TrailPoint[];
}

/** Linear interpolation between two coordinates by fraction f (0..1). */
function lerpPoint(a: GeoPoint, b: GeoPoint, f: number): GeoPoint {
  return { lat: a.lat + (b.lat - a.lat) * f, lng: a.lng + (b.lng - a.lng) * f };
}

/**
 * Build a breadcrumb trail sampled at even distance intervals along an ordered
 * route, with timestamps spread uniformly (constant speed) between start and end.
 */
export function buildBreadcrumbTrail(
  points: GeoPoint[],
  startMs: number,
  endMs: number,
): TrailPoint[] {
  if (
    points.length < 2 ||
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs)
  ) {
    return [];
  }

  // Cumulative great-circle distance at each route vertex.
  const cumulative: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative.push(
      cumulative[i - 1] +
        haversineDistance(
          points[i - 1].lat,
          points[i - 1].lng,
          points[i].lat,
          points[i].lng,
        ),
    );
  }

  const total = cumulative[cumulative.length - 1];
  if (total === 0) return [];

  // ~1 breadcrumb per 2 km, clamped so short and long trips both scrub smoothly.
  const samples = Math.max(24, Math.min(80, Math.round(total / 2000)));

  const trail: TrailPoint[] = [];
  let seg = 0;

  for (let i = 0; i < samples; i++) {
    const f = i / (samples - 1); // 0..1 along the whole route
    const targetDist = f * total;

    // Advance to the segment containing targetDist (monotonic — f only grows).
    while (seg < points.length - 2 && cumulative[seg + 1] < targetDist) {
      seg++;
    }

    const segLen = cumulative[seg + 1] - cumulative[seg];
    const segFraction =
      segLen === 0 ? 0 : (targetDist - cumulative[seg]) / segLen;
    const p = lerpPoint(points[seg], points[seg + 1], segFraction);

    trail.push({
      lat: p.lat,
      lng: p.lng,
      timestamp: Math.round(startMs + f * (endMs - startMs)),
    });
  }

  return sortAndDedupeTrail(trail);
}
