"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getTrip,
  getTripProgress,
  getTripRoute,
  getTripTimeline,
  progressFromVehicle,
  updateTripStatus,
} from "@/services/trip.service";
import { socket } from "@/lib/socket";
import {
  GeoPoint,
  getTripPermissions,
  RoutePoint,
  Trip,
  TripEvent,
  TripProgress,
  TripStatus,
} from "@/types/trip";
import { useAuthStore } from "@/store/auth-store";

/**
 * Loads a single trip + its lifecycle timeline for the detail page, and exposes
 * a role-aware status transition. Goes through the service only (never the mock).
 */
export function useTrip(id: string) {
  const { user } = useAuthStore();

  const permissions = useMemo(
    () => getTripPermissions(user?.role),
    [user?.role],
  );

  const [trip, setTrip] = useState<Trip | null>(null);
  const [timeline, setTimeline] = useState<TripEvent[]>([]);
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [progress, setProgress] = useState<TripProgress | null>(null);
  const [vehiclePosition, setVehiclePosition] = useState<GeoPoint | null>(null);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Latest route, kept in a ref so the live socket handler always projects onto
  // the current route without re-subscribing on every refetch (route is stable).
  const routeRef = useRef<RoutePoint[]>(route);
  useEffect(() => {
    routeRef.current = route;
  }, [route]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tripRes, timelineRes, routeRes, progressRes] = await Promise.all([
        getTrip(id),
        getTripTimeline(id),
        getTripRoute(id),
        getTripProgress(id),
      ]);
      setTrip(tripRes.trip);
      setTimeline(timelineRes.events);
      setRoute(routeRes.points);
      setProgress(progressRes.progress);
      setVehiclePosition(progressRes.vehiclePosition);
    } catch (err) {
      console.log(err);
      setError("Trip not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial load — inlined (not a call to refetch) to satisfy the
  // no-setState-in-effect lint rule, mirroring use-trips.
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setLive(false);
        const [tripRes, timelineRes, routeRes, progressRes] =
          await Promise.all([
            getTrip(id),
            getTripTimeline(id),
            getTripRoute(id),
            getTripProgress(id),
          ]);
        setTrip(tripRes.trip);
        setTimeline(timelineRes.events);
        setRoute(routeRes.points);
        setProgress(progressRes.progress);
        setVehiclePosition(progressRes.vehiclePosition);
      } catch (err) {
        console.log(err);
        setError("Trip not found");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  // Live progress (Milestone 6): reuse the tracking socket feed instead of
  // polling. When the assigned vehicle broadcasts a new position, recompute
  // progress against the loaded route — all GPS maths stays in the service.
  const vehicleId = trip?.vehicleId ?? null;
  useEffect(() => {
    if (!vehicleId) return;

    const handler = (payload: {
      id: string;
      latitude?: number;
      longitude?: number;
    }) => {
      if (!payload || payload.id !== vehicleId) return;

      const next = progressFromVehicle(routeRef.current, payload);
      if (!next.vehiclePosition) return; // ignore updates without a usable fix

      setProgress(next.progress);
      setVehiclePosition(next.vehiclePosition);
      setLive(true);
    };

    socket.on("vehicleLocationUpdate", handler);
    return () => {
      socket.off("vehicleLocationUpdate", handler);
    };
  }, [vehicleId]);

  const changeStatus = useCallback(
    async (status: TripStatus) => {
      const res = await updateTripStatus(id, status);
      await refetch();
      return res.trip;
    },
    [id, refetch],
  );

  return {
    trip,
    timeline,
    route,
    progress,
    vehiclePosition,
    live,
    loading,
    error,
    permissions,
    changeStatus,
    refetch,
  };
}
