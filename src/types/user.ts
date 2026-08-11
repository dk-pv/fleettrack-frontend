/**
 * Canonical application role — the single source of truth for FleetTrack roles.
 * Values are unchanged (ADMIN, CLIENT, VIEWER); every other module imports this type
 * instead of re-declaring it.
 */
export type UserRole = "ADMIN" | "CLIENT" | "VIEWER";
