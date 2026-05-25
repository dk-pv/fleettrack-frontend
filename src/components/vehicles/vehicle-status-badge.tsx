"use client";

interface VehicleStatusBadgeProps {
  status: string;
}

export default function VehicleStatusBadge({
  status,
}: VehicleStatusBadgeProps) {
  return (
    <select
      defaultValue={status}
      className={`h-9 rounded-full border px-3 text-xs font-medium outline-none transition-colors ${
        status === "Moving"
          ? "border-green-200 bg-green-500/10 text-green-600"
          : status === "Idle"
            ? "border-yellow-200 bg-yellow-500/10 text-yellow-600"
            : "border-red-200 bg-red-500/10 text-red-500"
      }`}
    >
      <option value="Moving">
        Moving
      </option>

      <option value="Idle">
        Idle
      </option>

      <option value="Offline">
        Offline
      </option>
    </select>
  );
}