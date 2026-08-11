"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getDashboardStats,
  getActiveVehicles,
  getTripSummary,
  getDeliveryMetrics,
} from "@/services/dashboard.service";

import { TripSummary, DeliveryMetrics } from "@/types/trip";
import { useClientStore } from "@/store/client-store";

export function useDashboard() {
  const { selectedClient } =
    useClientStore();

  const [stats, setStats] =
    useState<Record<string, unknown> | null>(null);

  const [vehicles, setVehicles] =
    useState<Record<string, unknown>[]>([]);

  const [tripSummary, setTripSummary] =
    useState<TripSummary | null>(null);

  const [deliveryMetrics, setDeliveryMetrics] =
    useState<DeliveryMetrics | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const clientId = selectedClient?.id;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const statsData = await getDashboardStats(clientId);
      setStats(statsData.data);

      const vehicleData = await getActiveVehicles(clientId);
      setVehicles(vehicleData.data || []);

      const summaryData = await getTripSummary(clientId);
      setTripSummary(summaryData.data);

      const metricsData = await getDeliveryMetrics(clientId);
      setDeliveryMetrics(metricsData.data);
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Initial load + reload when the scoped client changes. Inlined (not a call to
  // `load`) to satisfy the no-setState-in-effect lint rule, mirroring use-trips.
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(false);

        const statsData = await getDashboardStats(clientId);
        setStats(statsData.data);

        const vehicleData = await getActiveVehicles(clientId);
        setVehicles(vehicleData.data || []);

        const summaryData = await getTripSummary(clientId);
        setTripSummary(summaryData.data);

        const metricsData = await getDeliveryMetrics(clientId);
        setDeliveryMetrics(metricsData.data);
      } catch (err) {
        console.log(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [clientId]);

  return {
    stats,
    vehicles,
    tripSummary,
    deliveryMetrics,
    loading,
    error,
    reload: load,
  };
}