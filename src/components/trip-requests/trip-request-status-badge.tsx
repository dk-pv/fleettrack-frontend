"use client";

import { TripRequestStatus } from "@/types/trip-request";

// Mirrors the trip status-badge pattern (colored pill on theme tokens): PENDING = amber
// (waiting), APPROVED = green (success), REJECTED = red (destructive).
const STYLES: Record<TripRequestStatus, string> = {
  [TripRequestStatus.PENDING]: "bg-warning/10 text-warning border-warning/15",
  [TripRequestStatus.APPROVED]: "bg-success/10 text-success border-success/15",
  [TripRequestStatus.REJECTED]:
    "bg-destructive/10 text-destructive border-destructive/15",
};

export default function TripRequestStatusBadge({
  status,
}: {
  status: TripRequestStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
