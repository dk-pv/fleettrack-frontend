export type UserRole = "ADMIN" | "VIEWER" | "CLIENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}