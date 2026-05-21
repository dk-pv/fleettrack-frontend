"use client";

import { useState } from "react";

import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-foreground transition-colors duration-300 dark:bg-[#0b1120]">
      <Sidebar expanded={expanded} setExpanded={setExpanded} />

      <div
        className={`transition-all duration-300 ${
          expanded ? "ml-[250px]" : "ml-[88px]"
        }`}
      >
        <Navbar expanded={expanded} />

        <section className="pt-16">{children}</section>
      </div>
    </main>
  );
}
