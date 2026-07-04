"use client";

import { useEffect, useState } from "react";

import {
  checkDriverOverlap,
  checkVehicleOverlap,
} from "@/services/trip.service";
import { OverlapConflict } from "@/types/trip";

type OverlapResource = "vehicle" | "driver";

/**
 * Live double-booking check for the trip form, shared by vehicle and driver
 * validation (Milestones 7 & 8). Re-runs through the service whenever the
 * selected resource or schedule changes, so the client sees a clash before
 * submitting; components use this hook, never the service directly.
 *
 * Accepts raw form values (datetime-local or ISO strings); stays empty until the
 * resource is chosen and the window is valid (end after start).
 */
export function useOverlapCheck(
  resource: OverlapResource,
  input: {
    resourceId: string;
    scheduledStart: string;
    scheduledEnd: string;
    excludeTripId?: string;
  },
) {
  const { resourceId, scheduledStart, scheduledEnd, excludeTripId } = input;

  const [conflicts, setConflicts] = useState<OverlapConflict[]>([]);
  const [checking, setChecking] = useState(false);

  const enabled =
    !!resourceId &&
    !!scheduledStart &&
    !!scheduledEnd &&
    new Date(scheduledEnd) > new Date(scheduledStart);

  useEffect(() => {
    // Inlined (not a shared callback) to satisfy the no-setState-in-effect rule.
    async function run() {
      if (!enabled) {
        setConflicts([]);
        setChecking(false);
        return;
      }
      try {
        setChecking(true);
        const res =
          resource === "vehicle"
            ? await checkVehicleOverlap({
                vehicleId: resourceId,
                scheduledStart,
                scheduledEnd,
                excludeTripId,
              })
            : await checkDriverOverlap({
                driverId: resourceId,
                scheduledStart,
                scheduledEnd,
                excludeTripId,
              });
        setConflicts(res.conflicts);
      } catch (err) {
        console.log(err);
        setConflicts([]);
      } finally {
        setChecking(false);
      }
    }

    run();
  }, [
    resource,
    resourceId,
    scheduledStart,
    scheduledEnd,
    excludeTripId,
    enabled,
  ]);

  return { hasOverlap: conflicts.length > 0, conflicts, checking };
}
