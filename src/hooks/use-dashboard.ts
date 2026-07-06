"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getDashboardStats,
  getActiveVehicles,
  getTripSummary,
} from "@/services/dashboard.service";

import { TripSummary } from "@/types/trip";
import { useClientStore } from "@/store/client-store";

export function useDashboard() {
  const { selectedClient } =
    useClientStore();

  const [stats, setStats] =
    useState<any>(null);

  const [vehicles, setVehicles] =
    useState<any[]>([]);

  const [tripSummary, setTripSummary] =
    useState<TripSummary | null>(null);

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

        const summaryData =
          await getTripSummary(
            clientId,
          );

        setTripSummary(
          summaryData.data,
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
    tripSummary,
    loading,
  };
}