interface ClientStatusBadgeProps {
  status: string;
}

export default function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border border-success/15 text-success">
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      {status}
    </div>
  );
}
