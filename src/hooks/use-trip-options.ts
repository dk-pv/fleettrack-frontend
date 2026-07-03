"use client";

import { useEffect, useState } from "react";

import { getTripFormOptions } from "@/services/trip.service";
import { TripDriver, TripVehicle } from "@/types/trip";

/**
 * Loads assignable vehicles & drivers for the trip creation form.
 * Goes through the service (never the mock) so it swaps to the real API cleanly.
 */
export function useTripOptions() {
  const [vehicles, setVehicles] = useState<TripVehicle[]>([]);
  const [drivers, setDrivers] = useState<TripDriver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getTripFormOptions();
        setVehicles(data.vehicles);
        setDrivers(data.drivers);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { vehicles, drivers, loading };
}
