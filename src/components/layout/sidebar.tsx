"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Truck } from "lucide-react";
import { LayoutDashboard, Map, Users, Settings } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

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
    title: "Users",
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
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  setExpanded: (value: boolean) => void;
}

export default function Sidebar({
  expanded,
  sidebarOpen,
  setSidebarOpen,
  setExpanded,
}: SidebarProps) {
  const pathname = usePathname();

  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        onMouseEnter={() => {
          if (window.innerWidth >= 1024) {
            setExpanded(true);
          }
        }}
        onMouseLeave={() => {
          if (window.innerWidth >= 1024) {
            setExpanded(false);
          }
        }}
        className={`
        fixed left-0 top-0 z-[100] flex h-screen flex-col
          border-r border-white/10
          bg-[linear-gradient(180deg,#111827_0%,#0f172a_55%,#020817_100%)]
          text-white
          transition-all duration-300

          ${expanded ? "lg:w-[250px]" : "lg:w-[88px]"}

          w-[280px] max-w-[85vw]

          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <Truck className="h-5 w-5" />
            </div>

            <div
              className={`transition-all duration-200 ${
                expanded ? "lg:block" : "lg:hidden"
              } block`}
            >
              <h1 className="text-xl font-bold">FleetTrack</h1>

              <p className="text-xs text-slate-400">GPS Monitoring</p>
            </div>
          </div>

          {/* Mobile Close */}
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-6">
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
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex h-[52px] items-center gap-4 rounded-xl px-4
                        transition-all duration-300

                        ${
                          active
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 min-w-5" />

                      <span
                        className={`
                          text-sm font-medium whitespace-nowrap

                          ${expanded ? "lg:block" : "lg:hidden"}

                          block
                        `}
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
            className={`
              text-xs text-slate-500

              ${expanded ? "lg:block" : "lg:hidden"}

              block
            `}
          >
            Version 1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
