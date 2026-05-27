"use client";

import { Bell, ChevronDown, CircleCheck, LogOut } from "lucide-react";

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
}

export default function Navbar({ expanded }: NavbarProps) {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const getInitials = () => {
    if (!user?.name) {
      return "U";
    }

    return user.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatRole = (role?: string) => {
    if (!role) {
      return "User";
    }

    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <header
      className={`fixed right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-8 transition-all duration-300 ${
        expanded ? "left-[250px]" : "left-[88px]"
      }`}
    >
      {/* Search */}
      <div className="w-full max-w-xl">
        <input
          type="text"
          placeholder="Search vehicles, drivers, trips..."
          className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground focus:border-primary"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        {/* System Status */}
        <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">
          <CircleCheck className="h-4 w-4" />

          <span>All Systems Online</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification */}
        <button className="relative">
          <Bell className="h-5 w-5 text-foreground" />

          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            3
          </span>
        </button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 outline-none">
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                {getInitials()}
              </div>

              {/* User Info */}
              <div className="hidden text-left md:block">
                <h4 className="text-sm font-semibold">
                  {user?.name || "Unknown User"}
                </h4>

                <p className="text-xs text-muted-foreground">
                  {formatRole(user?.role)}
                </p>
              </div>

              <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
