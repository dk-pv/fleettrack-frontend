interface ClientRoleBadgeProps {
  role: string;
}

export default function ClientRoleBadge({
  role,
}: ClientRoleBadgeProps) {
  const normRole = role?.toUpperCase();
  const isAdmin = normRole === "ADMIN";
  const isManager = normRole === "FLEET_MANAGER" || normRole === "FLEET MANAGER";

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${
        isAdmin
          ? "bg-purple-500/10 text-purple-600 border-purple-500/15"
          : isManager
            ? "bg-primary/10 text-primary border-primary/15"
            : "bg-muted text-muted-foreground border-border"
      }`}
    >
      {role?.replaceAll("_", " ")}
    </div>
  );
}