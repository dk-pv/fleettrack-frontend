"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types/user";
import type { CreateTripDto } from "@/types/trip";
import { TripRequest } from "@/types/trip-request";
import {
  approveTripRequest,
  createTripRequest,
  getTripRequests,
  rejectTripRequest,
} from "@/services/trip-request.service";

/**
 * Single access point for Trip Request data. Components consume this hook only — they
 * never import the service directly. Scoping mirrors the future API: ADMIN sees all,
 * CLIENT sees only its own (the service applies it). Local React state only — no global
 * store (the existing hooks convention). Swapping the service to the real API needs no
 * change here.
 */
export function useTripRequests() {
  const { user } = useAuthStore();
  const role: UserRole = user?.role ?? "CLIENT";

  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(false);
      try {
        const data = await getTripRequests(role);
        setRequests(data);
      } catch (err) {
        console.log(err);
        if (!silent) setError(true);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [role],
  );

  // Initial load + reload when the role resolves/changes. Inlined (not a call to `load`)
  // with an unmount guard, mirroring the other data hooks.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await getTripRequests(role);
        if (active) setRequests(data);
      } catch (err) {
        console.log(err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [role]);

  const create = useCallback(
    async (dto: CreateTripDto) => {
      const created = await createTripRequest(dto);
      await load(true);
      return created;
    },
    [load],
  );

  const approve = useCallback(
    async (id: string) => {
      const updated = await approveTripRequest(id);
      await load(true);
      return updated;
    },
    [load],
  );

  const reject = useCallback(
    async (id: string, reason: string) => {
      const updated = await rejectTripRequest(id, reason);
      await load(true);
      return updated;
    },
    [load],
  );

  return {
    requests,
    loading,
    error,
    role,
    create,
    approve,
    reject,
    refresh: () => load(),
  };
}
