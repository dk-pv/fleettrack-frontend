"use client";

interface VehicleStatusBadgeProps {
  status: string;
}

export default function VehicleStatusBadge({
  status,
}: VehicleStatusBadgeProps) {
  const isMoving = status === "MOVING";
  const isIdle = status === "IDLE";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${
        isMoving
          ? "bg-success/10 text-success border-success/15"
          : isIdle
            ? "bg-warning/10 text-warning border border-warning/15"
            : "bg-destructive/10 text-destructive border border-destructive/15"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${
        isMoving
          ? "bg-success"
          : isIdle
            ? "bg-warning"
            : "bg-destructive"
      }`} />
      {status}
    </div>
  );
}
