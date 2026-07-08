"use client";

import { useEffect, useState } from "react";

import { socket } from "@/lib/socket";
import { getTrips } from "@/services/trip.service";
import { getLiveVehicles, LiveVehicle } from "@/services/vehicle.service";
import { isEtaActive, Trip } from "@/types/trip";
import { useAuthStore } from "@/store/auth-store";
import { useClientStore } from "@/store/client-store";

/**
 * Live operations feed (DSH-02). Reuses existing infrastructure only — no new
 * backend, no new socket connection, no polling:
 *  - ongoing trips from GET /trips (kept to ETA_ACTIVE_STATUSES);
 *  - a live vehicle/driver status map seeded from GET /vehicles and then patched
 *    from the shared tracking socket's `vehicleLocationUpdate` events.
 *
 * The trip set is fetched once per client scope (trips change on lifecycle events,
 * not every GPS tick); the near-real-time part — vehicle & driver status — is the
 * socket. One centralized subscription with specific-handler cleanup so it never
 * clobbers other listeners.
 */
export function useLiveOps() {
  const { user } = useAuthStore();
  const { selectedClient } = useClientStore();

  // A CLIENT is pinned to its own trips; an ADMIN may narrow by the selected client.
  const clientId = user?.role === "CLIENT" ? user.id : selectedClient?.id;

  const [ongoingTrips, setOngoingTrips] = useState<Trip[]>([]);
  const [liveVehicles, setLiveVehicles] = useState<Record<string, LiveVehicle>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  // Initial snapshot: ongoing trips + a seed of live vehicle status. Inlined async
  // (no-setState-in-effect lint rule); re-run on clientId change (ADMIN filter).
  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [tripsRes, vehicles] = await Promise.all([
          getTrips(clientId),
          getLiveVehicles(),
        ]);
        if (!active) return;
        setOngoingTrips(tripsRes.trips.filter((t) => isEtaActive(t.status)));
        setLiveVehicles(
          Object.fromEntries(vehicles.map((v) => [v.id, v])),
        );
      } catch (err) {
        console.log(err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [clientId]);

  // Live vehicle/driver status via the shared tracking socket (reused singleton —
  // not a new connection). Patches the status map in place on each broadcast.
  useEffect(() => {
    const handler = (payload: LiveVehicle) => {
      if (!payload?.id) return;
      setLiveVehicles((prev) => ({
        ...prev,
        [payload.id]: {
          id: payload.id,
          vehicleNumber: payload.vehicleNumber,
          driverName: payload.driverName,
          status: payload.status,
          speed: payload.speed,
          isOnline: payload.isOnline,
        },
      }));
    };

    socket.on("vehicleLocationUpdate", handler);

    return () => {
      socket.off("vehicleLocationUpdate", handler);
    };
  }, []);

  return { ongoingTrips, liveVehicles, loading };
}
