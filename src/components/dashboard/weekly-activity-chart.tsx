"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";

import { weeklyActivity } from "@/data/dashboard-data";

export default function WeeklyActivityChart() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="mb-6 text-lg font-semibold">
        Weekly Activity
      </h3>

      <div className="h-[260px] min-w-0">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart data={weeklyActivity}>
            <XAxis dataKey="day" />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#14b8a6"
              fill="#14b8a6"
              fillOpacity={0.35}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}