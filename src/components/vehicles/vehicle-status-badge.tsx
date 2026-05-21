interface VehicleStatusBadgeProps {
  status: string;
}

export default function VehicleStatusBadge({
  status,
}: VehicleStatusBadgeProps) {
  return (
    <div
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        status === "Moving"
          ? "bg-green-500/10 text-green-600"
          : status === "Idle"
            ? "bg-yellow-500/10 text-yellow-600"
            : "bg-red-500/10 text-red-500"
      }`}
    >
      {status}
    </div>
  );
}