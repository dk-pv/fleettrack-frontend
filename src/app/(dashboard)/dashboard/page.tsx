import ActiveVehicles from "@/components/dashboard/active-vehicles";
import FleetStatusChart from "@/components/dashboard/fleet-status-chart";
import StatsCard from "@/components/dashboard/stats-card";
import WeeklyActivityChart from "@/components/dashboard/weekly-activity-chart";

import { statsData } from "@/data/dashboard-data";

export default function DashboardPage() {
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
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {statsData.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            value={item.value}
            description={item.description}
            color={item.color as "default" | "green" | "red"}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
        <FleetStatusChart />

        <div className="xl:col-span-2">
          <WeeklyActivityChart />
        </div>
      </div>

      {/* Vehicles */}
      <div className="grid grid-cols-1 xl:grid-cols-2">
        <ActiveVehicles />
      </div>
    </div>
  );
}
