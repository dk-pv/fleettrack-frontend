import { apiFetch } from "@/lib/fetcher";

/* DASHBOARD STATS */
export async function getDashboardStats(clientId?: string) {
  const query = clientId
    ? `?clientId=${clientId}`
    : "";

  const response = await apiFetch(
    `/dashboard/stats${query}`
  );

  return response.json();
}

/* ACTIVE VEHICLES */
export async function getActiveVehicles(clientId?: string) {
  const query = clientId
    ? `?clientId=${clientId}`
    : "";

  const response = await apiFetch(
    `/dashboard/active-vehicles${query}`
  );

  return response.json();
}