"use client";

import {
  Navigation,
  CalendarClock,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  Percent,
} from "lucide-react";

import ActiveVehicles from "@/components/dashboard/active-vehicles";
import EtaOverview from "@/components/dashboard/eta-overview";
import FleetStatusChart from "@/components/dashboard/fleet-status-chart";
import LiveOperations from "@/components/dashboard/live-operations";
import StatsCard from "@/components/dashboard/stats-card";
import WeeklyActivityChart from "@/components/dashboard/weekly-activity-chart";

import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardSkeleton } from "@/components/ui/skeletons/dashboard-skeleton";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardPage() {
  const {
    stats,
    vehicles,
    tripSummary,
    deliveryMetrics,
    weeklyActivity,
    loading,
    error,
    reload,
  } = useDashboard();

  // Only the aggregate blocks (cards + charts + vehicles) wait on useDashboard. The
  // trip/ETA tables below own their own loading, error and empty states, so gating
  // them here just delayed their requests until all four aggregate calls had finished.
  const summary = loading ? (
    <DashboardSkeleton />
  ) : error ? (
    <ErrorState message="Couldn't load the dashboard." onRetry={reload} />
  ) : (
    <>
      {/* Header */}

      <div>
        <h1 className="page-title">Dashboard Overview</h1>

        <p className="mt-1 text-sm text-muted-foreground">
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

      {/* Delivery performance (DSH-04) */}

      <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="On-time Deliveries"
          value={deliveryMetrics?.onTime ?? 0}
          description="Arrived by schedule"
          color="green"
          icon={CheckCircle2}
        />

        <StatsCard
          title="Delayed Deliveries"
          value={deliveryMetrics?.delayed ?? 0}
          description="Arrived late"
          color="red"
          icon={AlertTriangle}
        />

        <StatsCard
          title="Completed Trips"
          value={deliveryMetrics?.completed ?? 0}
          description="Total delivered"
          icon={PackageCheck}
        />

        <StatsCard
          title="Completion Rate"
          value={`${deliveryMetrics?.completionRate ?? 0}%`}
          description="Completed of all trips"
          icon={Percent}
        />

        <StatsCard
          title="On-time Rate"
          value={`${deliveryMetrics?.onTimeRate ?? 0}%`}
          description="On-time of completed"
          color="green"
          icon={Percent}
        />

        <StatsCard
          title="Delayed Rate"
          value={`${deliveryMetrics?.delayedRate ?? 0}%`}
          description="Delayed of completed"
          color="red"
          icon={Percent}
        />
      </div>

      {/* Stats */}

      <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3">
        <StatsCard
          title="Total Vehicles"
          value={Number(stats?.totalVehicles) || 0}
          description="Fleet size"
        />

        <StatsCard
          title="Active Vehicles"
          value={Number(stats?.activeVehicles) || 0}
          description="Currently moving"
          color="green"
        />

        <StatsCard
          title="Offline Vehicles"
          value={Number(stats?.offlineVehicles) || 0}
          description="No signal"
          color="red"
        />
      </div>

      {/* Charts */}

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
        <FleetStatusChart
          activeVehicles={Number(stats?.activeVehicles) || 0}
          offlineVehicles={Number(stats?.offlineVehicles) || 0}
          idleVehicles={Number(stats?.idleVehicles) || 0}
        />

        <div className="min-w-0 xl:col-span-2">
          <WeeklyActivityChart days={weeklyActivity} />
        </div>
      </div>

      {/* Vehicles */}

      <div className="grid min-w-0 grid-cols-1 xl:grid-cols-2">
        <ActiveVehicles vehicles={vehicles} />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {summary}

      {/* Active trip ETAs (DSH-03) */}

      <EtaOverview />

      {/* Live operations — ongoing trips + live driver/vehicle status (DSH-02) */}

      <LiveOperations />
    </div>
  );
}
