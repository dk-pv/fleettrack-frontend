"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Truck } from "lucide-react";
import { LayoutDashboard, Map, Users, Settings ,UserCog, Route, Building2} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

export const sidebarMenu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["ADMIN", "CLIENT", "VIEWER"],
  },
  {
    title: "Live Tracking",
    icon: Map,
    href: "/tracking",
    roles: ["ADMIN", "CLIENT", "VIEWER"],
  },
  {
    title: "Vehicles",
    icon: Truck,
    href: "/vehicles",
    roles: ["ADMIN", "CLIENT", "VIEWER"],
  },
  {
    title: "Trips",
    icon: Route,
    href: "/trips",
    roles: ["ADMIN", "CLIENT"],
  },
  {
    title: "clients",
    icon: Users,
    href: "/clients",
    roles: ["ADMIN"],
  },
  {
    title: "Customers",
    icon: Building2,
    href: "/customers",
    roles: ["CLIENT"],
  },
   {
    title: "Users",
    icon: UserCog,
    href: "/users",
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
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs lg:hidden"
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
          border-r border-border
          bg-card
          text-card-foreground
          transition-all duration-300 ease-in-out

          ${expanded ? "lg:w-[250px]" : "lg:w-[88px]"}

          w-[280px] max-w-[85vw]

          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-5 h-16">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-300 hover:scale-105">
              <Truck className="h-4.5 w-4.5" />
            </div>

            <div
              className={`transition-all duration-300 ${
                expanded ? "opacity-100 translate-x-0 lg:block" : "opacity-0 -translate-x-4 lg:hidden"
              } block`}
            >
              <h1 className="text-sm font-semibold tracking-tight leading-none text-foreground">FleetTrack</h1>

              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wider uppercase">GPS Portal</p>
            </div>
          </div>

          {/* Mobile Close */}
          <button 
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" 
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar">
          <ul className="space-y-1">
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
                        relative flex h-10 items-center gap-3.5 rounded-lg px-3.5
                        transition-all duration-200 group/navlink

                        ${
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        }
                      `}
                    >
                      {/* Left border active indicator */}
                      {active && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-primary" />
                      )}

                      <Icon className={`h-4.5 w-4.5 min-w-[18px] transition-transform duration-200 group-hover/navlink:scale-105 ${active ? "text-primary" : "text-muted-foreground group-hover/navlink:text-foreground"}`} />

                      <span
                        className={`
                          text-xs font-medium whitespace-nowrap transition-all duration-300

                          ${expanded ? "opacity-100 translate-x-0 lg:block" : "opacity-0 -translate-x-2 lg:hidden"}

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
        <div className="border-t border-border px-5 py-4 flex items-center justify-between">
          <p
            className={`
              text-[10px] text-muted-foreground font-semibold uppercase tracking-wider

              ${expanded ? "lg:block" : "lg:hidden"}

              block
            `}
          >
            v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
