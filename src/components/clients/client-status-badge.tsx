interface ClientStatusBadgeProps {
  status: string;
}

export default function ClientStatusBadge({
  status,
}: ClientStatusBadgeProps) {
  return (
    <div className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
      {status}
    </div>
  );
}