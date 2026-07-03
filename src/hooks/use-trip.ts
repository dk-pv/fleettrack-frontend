"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getTrip,
  getTripRoute,
  getTripTimeline,
  updateTripStatus,
} from "@/services/trip.service";
import {
  getTripPermissions,
  RoutePoint,
  Trip,
  TripEvent,
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tripRes, timelineRes, routeRes] = await Promise.all([
        getTrip(id),
        getTripTimeline(id),
        getTripRoute(id),
      ]);
      setTrip(tripRes.trip);
      setTimeline(timelineRes.events);
      setRoute(routeRes.points);
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
        const [tripRes, timelineRes, routeRes] = await Promise.all([
          getTrip(id),
          getTripTimeline(id),
          getTripRoute(id),
        ]);
        setTrip(tripRes.trip);
        setTimeline(timelineRes.events);
        setRoute(routeRes.points);
      } catch (err) {
        console.log(err);
        setError("Trip not found");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

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
    loading,
    error,
    permissions,
    changeStatus,
    refetch,
  };
}
