

export interface TrailPoint {
  lat: number;
  lng: number;
  timestamp: number; // Unix ms
  heading?: number;  // degrees 0–360
  speed?: number;    // km/h
}

/* -------------------------------------------------- */
/* HAVERSINE DISTANCE                                  */
/* -------------------------------------------------- */

const EARTH_RADIUS_M = 6371000;

/**
 * Calculates the great-circle distance (in meters) between two GPS coordinates.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/* -------------------------------------------------- */
/* BEARING (HEADING)                                   */
/* -------------------------------------------------- */

/**
 * Calculates bearing in degrees (0 = North, 90 = East) from point A to point B.
 */
export function calculateBearing(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLng = toRad(lng2 - lng1);
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);

  const y = Math.sin(dLng) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(dLng);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/* -------------------------------------------------- */
/* COORDINATE VALIDATION                               */
/* -------------------------------------------------- */

/**
 * Returns true if the coordinate is a valid GPS position.
 * Filters out 0,0 (null island), extreme values, and NaN.
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/* -------------------------------------------------- */
/* GPS NOISE FILTER                                    */
/* -------------------------------------------------- */

const MIN_DISTANCE_METERS = 10; // skip points closer than this

/**
 * Removes GPS jitter by filtering out points that are too close
 * to their predecessor (< MIN_DISTANCE_METERS apart).
 */
export function filterGPSNoise(
  points: TrailPoint[],
  minDistanceMeters = MIN_DISTANCE_METERS,
): TrailPoint[] {
  if (points.length === 0) return [];

  const filtered: TrailPoint[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = points[i];

    if (!isValidCoordinate(curr.lat, curr.lng)) continue;

    const dist = haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    if (dist >= minDistanceMeters) {
      filtered.push(curr);
    }
  }

  return filtered;
}

/* -------------------------------------------------- */
/* SORT BY TIMESTAMP                                   */
/* -------------------------------------------------- */

/**
 * Sorts trail points chronologically by timestamp.
 * Removes any points with the exact same timestamp as a predecessor.
 */
export function sortAndDedupeTrail(points: TrailPoint[]): TrailPoint[] {
  const sorted = [...points].sort((a, b) => a.timestamp - b.timestamp);

  const deduped: TrailPoint[] = [];
  for (const p of sorted) {
    if (deduped.length === 0) {
      deduped.push(p);
    } else {
      const last = deduped[deduped.length - 1];
      if (p.timestamp !== last.timestamp) {
        deduped.push(p);
      }
    }
  }

  return deduped;
}

/* -------------------------------------------------- */
/* ADD HEADINGS TO TRAIL                               */
/* -------------------------------------------------- */

/**
 * Enriches a sorted trail with bearing/heading between consecutive points.
 */
export function enrichWithHeadings(points: TrailPoint[]): TrailPoint[] {
  return points.map((p, i) => {
    if (i === 0) return { ...p, heading: p.heading ?? 0 };

    const prev = points[i - 1];
    const bearing = calculateBearing(prev.lat, prev.lng, p.lat, p.lng);
    return { ...p, heading: bearing };
  });
}

/* -------------------------------------------------- */
/* TRAIL SEGMENTS FOR FADE EFFECT                      */
/* -------------------------------------------------- */

export interface TrailSegment {
  positions: [number, number][];
  opacity: number;
  weight: number;
}

/**
 * Splits a trail into 3 segments with fading opacity for a professional
 * GPS trail effect (recent = bright, old = faint).
 */
export function buildFadedTrailSegments(points: TrailPoint[]): TrailSegment[] {
  if (points.length < 2) return [];

  const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);
  const total = latLngs.length;

  const segments: TrailSegment[] = [];

  if (total <= 15) {
    // Short trail — single bright segment
    segments.push({ positions: latLngs, opacity: 0.95, weight: 5 });
    return segments;
  }

  // Recent segment: last 15 points
  segments.push({
    positions: latLngs.slice(total - 15),
    opacity: 0.95,
    weight: 5,
  });

  // Mid segment
  const midStart = Math.max(0, total - 60);
  if (total - 15 > midStart) {
    segments.push({
      positions: latLngs.slice(midStart, total - 14),
      opacity: 0.55,
      weight: 4,
    });
  }

  // Old segment
  if (midStart > 0) {
    segments.push({
      positions: latLngs.slice(0, midStart + 1),
      opacity: 0.25,
      weight: 3,
    });
  }

  return segments;
}

/* -------------------------------------------------- */
/* SMOOTH INTERPOLATION (for follow-camera)           */
/* -------------------------------------------------- */

/**
 * Linearly interpolates between two headings, taking the short arc.
 */
export function lerpHeading(a: number, b: number, t: number): number {
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return (a + diff * t + 360) % 360;
}
