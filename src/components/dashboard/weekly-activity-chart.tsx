"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useEffect, useState } from "react";

import { weeklyActivity } from "@/data/dashboard-data";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          {payload[0].payload.day}
        </p>

        <p className="mt-1 text-sm font-extrabold text-foreground">
          {payload[0].value} Active Trips
        </p>
      </div>
    );
  }

  return null;
};

export default function WeeklyActivityChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Weekly Activity
        </h3>

        <p className="text-xs text-muted-foreground mt-1">Fleet utilization trends over the past week</p>
      </div>

      <div className="h-[240px] w-full mt-6 min-h-0 min-w-0">
        {mounted && (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
          >
            <AreaChart 
              data={weeklyActivity}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid 
                strokeDasharray="4 4" 
                stroke="var(--border)" 
                vertical={false} 
              />

              <XAxis 
                dataKey="day" 
                tickLine={false}
                axisLine={false}
                dy={10}
                style={{ fontSize: "11px", fill: "var(--muted-foreground)", fontWeight: 500 }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#activityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
