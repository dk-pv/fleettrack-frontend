"use client";

import ActiveVehicles from "@/components/dashboard/active-vehicles";
import FleetStatusChart from "@/components/dashboard/fleet-status-chart";
import StatsCard from "@/components/dashboard/stats-card";
import WeeklyActivityChart from "@/components/dashboard/weekly-activity-chart";

import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { stats, vehicles, loading } = useDashboard();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Dashboard Overview
        </h1>

        <p className="mt-2 text-muted-foreground">
          Monitor your fleet performance and activity
        </p>
      </div>

      {/* Stats */}

      <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3">
        <StatsCard
          title="Total Vehicles"
          value={stats?.totalVehicles || 0}
          description="Fleet size"
        />

        <StatsCard
          title="Active Vehicles"
          value={stats?.activeVehicles || 0}
          description="Currently moving"
          color="green"
        />

        <StatsCard
          title="Offline Vehicles"
          value={stats?.offlineVehicles || 0}
          description="No signal"
          color="red"
        />
      </div>

      {/* Charts */}

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
        <FleetStatusChart
          activeVehicles={stats?.activeVehicles || 0}
          offlineVehicles={stats?.offlineVehicles || 0}
        />

        <div className="min-w-0 xl:col-span-2">
          <WeeklyActivityChart />
        </div>
      </div>

      {/* Vehicles */}

      <div className="grid min-w-0 grid-cols-1 xl:grid-cols-2">
        <ActiveVehicles vehicles={vehicles} />
      </div>
    </div>
  );
}
