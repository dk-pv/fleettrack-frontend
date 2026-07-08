"use client";

import { useState } from "react";
import { Users, Download } from "lucide-react";
import { toast } from "sonner";

import { useDriverReport } from "@/hooks/use-driver-report";
import { exportDriverPerformanceReport } from "@/services/driver-report.service";
import { downloadResponse } from "@/lib/download";

const th =
  "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const inputClass =
  "h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary";

export default function DriverReportPage() {
  const { report, filter, setFilter, loading } = useDriverReport();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);

  const apply = () =>
    setFilter({ from: from || undefined, to: to || undefined });

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await exportDriverPerformanceReport(filter);
      if (!res.ok) throw new Error("Export failed");
      await downloadResponse(res, "driver-performance-report.pdf");
    } catch (err) {
      console.log(err);
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const { totals } = report;

  const summaryCards = [
    { label: "Drivers", value: totals.drivers },
    { label: "Trips", value: totals.trips },
    { label: "Completed", value: totals.completed },
    { label: "On-time", value: totals.onTime },
    { label: "Late", value: totals.delayed },
    { label: "Distance (km)", value: totals.totalDistanceKm },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-500/10 p-3">
            <Users className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Driver Report</h1>
            <p className="mt-1 text-muted-foreground">
              Per-driver trip volume, completion and on-time performance
            </p>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting..." : "Export PDF"}
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          onClick={apply}
          className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:opacity-90"
        >
          Apply
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {card.label}
            </p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* By driver */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">By driver</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left">
                <th className={th}>Driver</th>
                <th className={`${th} text-right`}>Trips</th>
                <th className={`${th} text-right`}>Completed</th>
                <th className={`${th} text-right`}>Active</th>
                <th className={`${th} text-right`}>Cancelled</th>
                <th className={`${th} text-right`}>On-time</th>
                <th className={`${th} text-right`}>Late</th>
                <th className={`${th} text-right`}>Completion</th>
                <th className={`${th} text-right`}>On-time %</th>
                <th className={`${th} text-right`}>Distance</th>
                <th className={`${th} text-right`}>Avg min</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Loading report...
                  </td>
                </tr>
              ) : report.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No driver trips in range
                  </td>
                </tr>
              ) : (
                report.rows.map((row) => (
                  <tr
                    key={row.driverId}
                    className="border-b border-border transition-colors last:border-none hover:bg-muted/40"
                  >
                    <td className="px-4 py-3 font-medium">
                      {row.driverName ?? row.driverId}
                    </td>
                    <td className="px-4 py-3 text-right">{row.totalTrips}</td>
                    <td className="px-4 py-3 text-right">{row.completed}</td>
                    <td className="px-4 py-3 text-right">{row.active}</td>
                    <td className="px-4 py-3 text-right">{row.cancelled}</td>
                    <td className="px-4 py-3 text-right">{row.onTime}</td>
                    <td className="px-4 py-3 text-right">{row.delayed}</td>
                    <td className="px-4 py-3 text-right">
                      {row.completionRate}%
                    </td>
                    <td className="px-4 py-3 text-right">{row.onTimeRate}%</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {row.totalDistanceKm}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {row.avgDurationMins}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
