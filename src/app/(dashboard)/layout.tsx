"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { useAuthStore } from "@/store/auth-store";
import { roleRoutes } from "@/lib/role-routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { token, hydrated, user } = useAuthStore();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  useEffect(() => {
    if (!hydrated || !user) return;

    const allowedRoutes = roleRoutes[user.role] ?? ["/dashboard"];

    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      router.replace("/dashboard");
    }
  }, [pathname, hydrated, user, router]);

  if (!hydrated || !token) {
    return null;
  }

  return (
    <main className="relative  min-h-screen overflow-hidden bg-[#f5f7fb] text-foreground transition-colors duration-300 dark:bg-[#0b1120]">
      {/* Sidebar */}
      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Wrapper */}

      <div
        className={`
    transition-all duration-300
    ${expanded ? "lg:ml-[250px]" : "lg:ml-[88px]"}
  `}
      >
        {/* Navbar */}
        <Navbar expanded={expanded} setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <section
          className={` min-h-screen pt-16 transition-all duration-300 ${pathname.startsWith("/tracking") ? "" : "px-4 pb-6 sm:px-6 lg:px-8"} `}
        >
          {" "}
          {children}{" "}
        </section>
      </div>
    </main>
  );
}
