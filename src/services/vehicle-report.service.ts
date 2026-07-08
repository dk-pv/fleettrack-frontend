import { apiFetch } from "@/lib/fetcher";
import {
  VehicleUtilizationReport,
  VehicleReportFilter,
  EMPTY_VEHICLE_UTILIZATION_REPORT,
} from "@/types/vehicle-report";

/**
 * Vehicle utilization report service (RPT-03). Reads report data and returns the raw
 * PDF export Response for download — the server owns both the query and the PDF (same
 * pattern as the trip/driver/cost reports), so there is no client-side report or
 * export logic.
 *
 *   API: GET /vehicle-reports/utilization         -> { range, totals, rows }
 *        GET /vehicle-reports/utilization/export  -> application/pdf
 */
function queryString(filter: VehicleReportFilter): string {
  const params = new URLSearchParams();
  if (filter.from) params.set("from", filter.from);
  if (filter.to) params.set("to", filter.to);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function getVehicleUtilizationReport(
  filter: VehicleReportFilter,
): Promise<VehicleUtilizationReport> {
  const res = await apiFetch(
    `/vehicle-reports/utilization${queryString(filter)}`,
  );
  if (!res.ok) return EMPTY_VEHICLE_UTILIZATION_REPORT;
  const data = await res.json();
  return {
    range: data.range ?? EMPTY_VEHICLE_UTILIZATION_REPORT.range,
    totals: data.totals ?? EMPTY_VEHICLE_UTILIZATION_REPORT.totals,
    rows: data.rows ?? [],
  };
}

export async function exportVehicleUtilizationReport(
  filter: VehicleReportFilter,
): Promise<Response> {
  return apiFetch(
    `/vehicle-reports/utilization/export${queryString(filter)}`,
  );
}
