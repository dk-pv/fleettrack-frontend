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
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Fleet Status
        </h3>
        <p className="text-sm text-muted-foreground mt-1">Real-time status breakdown</p>
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
            <span className="text-3xl font-semibold text-foreground tracking-tight leading-none tabular-nums">{total}</span>
            <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground mt-1">Total</span>
          </div>
        </div>

        {/* LEGEND */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-medium w-full">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="text-muted-foreground">Moving:</span>
            <span className="text-foreground font-semibold">{activeVehicles}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Offline:</span>
            <span className="text-foreground font-semibold">{offlineVehicles}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30">
            <div className="h-2.5 w-2.5 rounded-full bg-warning" />
            <span className="text-muted-foreground">Idle:</span>
            <span className="text-foreground font-semibold">{idleVehicles}</span>
          </div>
        </div>
      </div>
    </div>
  );
}