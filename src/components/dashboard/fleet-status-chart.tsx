"use client";

import {
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface FleetStatusChartProps {
  activeVehicles: number;
  offlineVehicles: number;
  idleVehicles: number;
}

const COLORS = [
  "#10b981",
  "#ef4444",
  "#f59e0b",
];

export default function FleetStatusChart({
  activeVehicles,
  offlineVehicles,
  idleVehicles,
}: FleetStatusChartProps) {
  const data = [
    {
      name: "Moving",
      value: activeVehicles,
    },

    {
      name: "Offline",
      value: offlineVehicles,
    },

    {
      name: "Idle",
      value: idleVehicles,
    },
  ];

  const total = activeVehicles + offlineVehicles + idleVehicles;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Fleet Status
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Real-time status breakdown</p>
      </div>

      <div className="flex flex-col items-center justify-center mt-6">
        <div className="relative h-[220px] w-[220px]">
          <PieChart
            width={220}
            height={220}
          >
            <Pie
              data={data}
              innerRadius={68}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map(
                (_, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[index]
                    }
                    stroke="var(--card)"
                    strokeWidth={2}
                  />
                ),
              )}
            </Pie>
          </PieChart>

          {/* Centered details overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-foreground tracking-tight">{total}</span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">Total</span>
          </div>
        </div>

        {/* LEGEND */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-medium w-full">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-muted/30">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">Moving:</span>
            <span className="text-foreground font-semibold">{activeVehicles}</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-muted/30">
            <div className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Offline:</span>
            <span className="text-foreground font-semibold">{offlineVehicles}</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-muted/30">
            <div className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">Idle:</span>
            <span className="text-foreground font-semibold">{idleVehicles}</span>
          </div>
        </div>
      </div>
    </div>
  );
}