interface ClientRoleBadgeProps {
  role: string;
}

export default function ClientRoleBadge({
  role,
}: ClientRoleBadgeProps) {
  return (
    <div
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        role === "Admin"
          ? "bg-purple-500/10 text-purple-600"
          : "bg-blue-500/10 text-blue-600"
      }`}
    >
      {role}
    </div>
  );
}