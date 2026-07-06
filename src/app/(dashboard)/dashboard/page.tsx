"use client";

import {
  Navigation,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import ActiveVehicles from "@/components/dashboard/active-vehicles";
import FleetStatusChart from "@/components/dashboard/fleet-status-chart";
import StatsCard from "@/components/dashboard/stats-card";
import WeeklyActivityChart from "@/components/dashboard/weekly-activity-chart";

import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { stats, vehicles, tripSummary, loading } = useDashboard();

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

      {/* Trip summary (DSH-01) — each card drills down to the filtered trip list */}

      <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Active Trips"
          value={tripSummary?.active ?? 0}
          description="In transit now"
          color="green"
          icon={Navigation}
          href="/trips?status=active"
        />

        <StatsCard
          title="Upcoming Trips"
          value={tripSummary?.upcoming ?? 0}
          description="Planned & assigned"
          icon={CalendarClock}
          href="/trips?status=upcoming"
        />

        <StatsCard
          title="Delayed Trips"
          value={tripSummary?.delayed ?? 0}
          description="Behind schedule"
          color="red"
          icon={AlertTriangle}
          href="/trips?status=delayed"
        />

        <StatsCard
          title="Completed Trips"
          value={tripSummary?.completed ?? 0}
          description="Finished"
          icon={CheckCircle2}
          href="/trips?status=completed"
        />
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
          idleVehicles={stats?.idleVehicles || 0}
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
