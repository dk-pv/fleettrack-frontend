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

import { WeeklyActivityDay } from "@/types/trip";

interface WeeklyActivityChartProps {
  /**
   * The last 7 days, oldest → newest, already bucketed and zero-filled by the server
   * (DSH-05). Rendered as-is — a day with no trips is a real 0, not a gap.
   */
  days: WeeklyActivityDay[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { label: string }; value: number }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
        <p className="text-xs font-bold text-muted-foreground">
          {payload[0].payload.label}
        </p>

        <p className="mt-1 text-sm font-extrabold text-foreground">
          {payload[0].value} Scheduled Trips
        </p>
      </div>
    );
  }

  return null;
};

export default function WeeklyActivityChart({
  days,
}: WeeklyActivityChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Weekly Activity
        </h3>

        <p className="text-sm text-muted-foreground mt-1">Scheduled trips over the last 7 days</p>
      </div>

      <div className="h-[240px] w-full mt-6 min-h-0 min-w-0">
        {mounted && (
          <ResponsiveContainer
            width="99%"
            height={240}
          >
            <AreaChart
              data={days}
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
                dataKey="label"
                tickLine={false}
                axisLine={false}
                dy={10}
                style={{ fontSize: "14px", fill: "var(--muted-foreground)", fontWeight: 500 }}
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
