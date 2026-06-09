"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getDashboardStats,
  getActiveVehicles,
} from "@/services/dashboard.service";

export function useDashboard() {
  /* STATS */

  const [stats, setStats] =
    useState<any>(null);

  /* VEHICLES */

  const [vehicles, setVehicles] =
    useState<any[]>([]);

  /* LOADING */

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        /* FETCH STATS */

        const statsData =
          await getDashboardStats();

        setStats(statsData.data);

        /* FETCH VEHICLES */

        const vehicleData =
          await getActiveVehicles();

        setVehicles(
          vehicleData.data || [],
        );
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return {
    stats,
    vehicles,
    loading,
  };
}