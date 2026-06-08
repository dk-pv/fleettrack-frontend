"use client";

import { Bell, ChevronDown, CircleCheck, LogOut, Menu } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import ThemeToggle from "./theme-toggle";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  expanded: boolean;
  setSidebarOpen: (value: boolean) => void;
}

export default function Navbar({ expanded, setSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const getInitials = () => {
    if (!user?.name) return "U";

    return user.name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatRole = (role?: string) => {
    if (!role) return "User";

    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <header
      className={`
        fixed top-0 right-0 z-30
        flex h-16 items-center justify-between
        border-b border-border
        bg-background/95 backdrop-blur
        px-4 sm:px-6 lg:px-8
        transition-all duration-300
        left-0
${expanded ? "lg:left-[250px]" : "lg:left-[88px]"}
      `}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="hidden md:block w-[260px] lg:w-[400px]">
          <input
            type="text"
            placeholder="Search vehicles..."
            className="
              h-11 w-full rounded-xl border border-border
              bg-muted px-4 text-sm outline-none
              placeholder:text-muted-foreground
              focus:border-primary
            "
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* System Status */}
        <div className="hidden xl:flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">
          <CircleCheck className="h-4 w-4" />
          <span>All Systems Online</span>
        </div>

        {/* Theme */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted">
          <Bell className="h-5 w-5" />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                {getInitials()}
              </div>

              <div className="hidden lg:block text-left">
                <h4 className="text-sm font-semibold">
                  {user?.name || "Unknown"}
                </h4>

                <p className="text-xs text-muted-foreground">
                  {formatRole(user?.role)}
                </p>
              </div>

              <ChevronDown className="hidden sm:block h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-500 focus:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
