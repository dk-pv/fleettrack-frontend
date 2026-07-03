"use client";

import { TripStatus } from "@/types/trip";

const STYLES: Record<TripStatus, string> = {
  [TripStatus.PLANNED]: "bg-blue-500/10 text-blue-600 border-blue-500/15",
  [TripStatus.ASSIGNED]:
    "bg-indigo-500/10 text-indigo-600 border-indigo-500/15",
  [TripStatus.STARTED]: "bg-cyan-500/10 text-cyan-600 border-cyan-500/15",
  [TripStatus.ONGOING]: "bg-warning/10 text-warning border-warning/15",
  [TripStatus.DELAYED]: "bg-orange-500/10 text-orange-600 border-orange-500/15",
  [TripStatus.COMPLETED]: "bg-success/10 text-success border-success/15",
  [TripStatus.CANCELLED]:
    "bg-destructive/10 text-destructive border-destructive/15",
};

export default function TripStatusBadge({ status }: { status: TripStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
