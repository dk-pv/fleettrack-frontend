export type AppRole = "ADMIN" | "CLIENT" | "VIEWER";

/**
 * Per-role allowed route prefixes (RBAC). ADMIN is the Fleet Owner — it owns the
 * fleet, so it keeps the company-wide operational views (dashboard, tracking,
 * vehicles) alongside platform management (clients, users, settings). The
 * client-only workflow modules (trips, delays, reports, notifications, customers)
 * stay CLIENT-scoped. Enforced client-side by RoleGuard and server-side by @Roles.
 */
export const roleRoutes: Record<AppRole, string[]> = {
  ADMIN: [
    "/dashboard",
    "/tracking",
    "/vehicles",
    "/clients",
    "/users",
    "/settings",
  ],

  CLIENT: [
    "/dashboard",
    "/tracking",
    "/vehicles",
    "/trips",
    "/delays",
    "/reports",
    "/notifications",
    "/customers",
  ],

  VIEWER: ["/dashboard", "/tracking", "/vehicles"],
};

/** Where to send a user who lands on a route their role can't access. */
export function roleLanding(): string {
  return "/dashboard";
}

/** True when `pathname` falls within one of the role's allowed route prefixes. */
export function isRouteAllowed(role: string, pathname: string): boolean {
  const allowed = roleRoutes[role as AppRole] ?? [];
  return allowed.some(
    (base) => pathname === base || pathname.startsWith(base + "/"),
  );
}
