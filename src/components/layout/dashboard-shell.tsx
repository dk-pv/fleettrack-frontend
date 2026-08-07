"use client";

import { useState } from "react";

import Sidebar from "./sidebar";
import Navbar from "./navbar";
import RoleGuard from "./role-guard";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const [expanded, setExpanded] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Navbar */}
      <Navbar
        expanded={expanded}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 ${
          expanded ? "lg:ml-[250px]" : "lg:ml-[88px]"
        }`}
      >
        <div className="min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-8">
          <RoleGuard>{children}</RoleGuard>
        </div>
      </main>
    </div>
  );
}
