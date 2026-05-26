"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { LayoutDashboard, Map, Truck, Users, Settings } from "lucide-react";

export const sidebarMenu = [
  {
    title: "Dashboard",

    icon: LayoutDashboard,

    href: "/dashboard",

    roles: ["ADMIN", "FLEET_MANAGER", "VIEWER"],
  },

  {
    title: "Live Tracking",

    icon: Map,

    href: "/tracking",

    roles: ["ADMIN", "FLEET_MANAGER"],
  },

  {
    title: "Vehicles",

    icon: Truck,

    href: "/vehicles",

    roles: ["ADMIN", "FLEET_MANAGER"],
  },

  {
    title: "Clients",

    icon: Users,

    href: "/clients",

    roles: ["ADMIN"],
  },

  {
    title: "Settings",

    icon: Settings,

    href: "/settings",

    roles: ["ADMIN"],
  },
];

interface SidebarProps {
  expanded: boolean;
  setExpanded: (value: boolean) => void;
}

export default function Sidebar({ expanded, setExpanded }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col overflow-hidden border-r border-white/5 bg-[linear-gradient(180deg,#111827_0%,#0f172a_55%,#020817_100%)] text-white transition-all duration-300 ${
        expanded ? "w-[250px]" : "w-[88px]"
      }`}
    >
      {/* Logo */}
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 min-w-11 items-center justify-center rounded-xl bg-[#2563eb]">
            <Truck className="h-5 w-5 text-white" />
          </div>

          <div
            className={`whitespace-nowrap transition-all duration-200 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            <h1 className="text-[24px] font-bold leading-none">FleetTrack</h1>

            <p className="mt-1 text-xs text-slate-400">GPS Monitoring</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {sidebarMenu
            .filter((item) => item.roles.includes(user?.role || "VIEWER"))
            .map((item) => {
              const Icon = item.icon;

              const active = pathname === item.href;

              return (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={`flex h-[50px] items-center gap-4 rounded-xl px-4 transition-all duration-300 ${
                      active
                        ? "bg-[#2563eb] text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 min-w-5" />

                    <span
                      className={`whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                        expanded ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {item.title}
                    </span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-5 py-5">
        <p
          className={`whitespace-nowrap text-xs text-slate-500 transition-all duration-200 ${
            expanded ? "opacity-100" : "opacity-0"
          }`}
        >
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
}
