import { apiFetch } from "@/lib/fetcher";

/* DASHBOARD STATS */

export async function getDashboardStats() {
  const response =
    await apiFetch(
      "/dashboard/stats"
    );

  return response.json();
}

/* ACTIVE VEHICLES */

export async function getActiveVehicles() {
  const response =
    await apiFetch(
      "/dashboard/active-vehicles"
    );

  return response.json();
}