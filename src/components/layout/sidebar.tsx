"use client";

import {
  LayoutDashboard,
  Map,
  Truck,
  Users,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    active: false,
  },
  {
    title: "Live Tracking",
    icon: Map,
    active: false,
  },
  {
    title: "Vehicles",
    icon: Truck,
    active: true,
  },
  {
    title: "Clients",
    icon: Users,
    active: false,
  },
  {
    title: "Settings",
    icon: Settings,
    active: false,
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col overflow-hidden border-r border-white/5 bg-[linear-gradient(180deg,#111827_0%,#0f172a_55%,#020817_100%)] text-white">
      {/* Logo */}
      <div className="border-b border-white/10 px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb]">
            <Truck className="h-5 w-5 text-white" />
          </div>

          <div>
            <h1 className="text-[30px] font-bold leading-none tracking-tight">
              FleetTrack
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              GPS Monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-7">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.title}>
                <button
                  className={`flex h-[52px] w-full items-center gap-4 rounded-2xl px-5 text-[15px] font-medium transition-all duration-300 ${
                    item.active
                      ? "bg-[#2563eb] text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-[19px] w-[19px]" />

                  <span>{item.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-5">
        <p className="text-xs text-slate-500">
          Version 1.0.0
        </p>
      </div>
    </aside>
  );
}