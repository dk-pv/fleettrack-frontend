"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getDashboardStats,
  getActiveVehicles,
} from "@/services/dashboard.service";

import { useClientStore } from "@/store/client-store";

export function useDashboard() {
  const { selectedClient } =
    useClientStore();

  const [stats, setStats] =
    useState<any>(null);

  const [vehicles, setVehicles] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const clientId =
          selectedClient?.id;

        const statsData =
          await getDashboardStats(
            clientId,
          );

        setStats(statsData.data);

        const vehicleData =
          await getActiveVehicles(
            clientId,
          );

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
  }, [selectedClient]);

  return {
    stats,
    vehicles,
    loading,
  };
}