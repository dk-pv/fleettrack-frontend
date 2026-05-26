import { create } from "zustand";

type UserRole = "ADMIN" | "FLEET_MANAGER" | "VIEWER";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthStore {
  user: User | null;

  token: string | null;

  setAuth: (user: User, token: string) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  token: null,

  setAuth: (user, token) => {
    localStorage.setItem("token", token);

    localStorage.setItem("user", JSON.stringify(user));

    set({
      user,
      token,
    });
  },

  logout: () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    // Old auth cleanup
    localStorage.removeItem("adminToken");

    localStorage.removeItem("adminRole");

    localStorage.removeItem("isLoggedIn");

    localStorage.removeItem("userEmail");

    set({
      user: null,
      token: null,
    });
  },
}));
