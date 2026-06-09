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
  "#eab308",
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

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="mb-6 text-lg font-semibold">
        Fleet Status
      </h3>

      <div className="flex flex-col items-center">
        <PieChart
          width={220}
          height={220}
        >
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map(
              (_, index) => (
                <Cell
                  key={index}
                  fill={
                    COLORS[index]
                  }
                />
              ),
            )}
          </Pie>
        </PieChart>

        {/* LEGEND */}

        <div className="mt-2 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-green-500" />

            Moving (
            {activeVehicles})
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-red-500" />

            Offline (
            {offlineVehicles})
          </div>

          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-yellow-500" />

            Idle (
            {idleVehicles})
          </div>
        </div>
      </div>
    </div>
  );
}