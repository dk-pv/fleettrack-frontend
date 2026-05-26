"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Navbar from "@/components/layout/navbar";

import Sidebar from "@/components/layout/sidebar";

import { useAuthStore } from "@/store/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const router = useRouter();

  const { token } =
    useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      mounted &&
      !token &&
      !localStorage.getItem("token")
    ) {
      router.push("/login");
    }
  }, [mounted, token]);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-foreground transition-colors duration-300 dark:bg-[#0b1120]">
      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
      />

      <div
        className={`transition-all duration-300 ${
          expanded
            ? "ml-[250px]"
            : "ml-[88px]"
        }`}
      >
        <Navbar expanded={expanded} />

        <section className="pt-16">
          {children}
        </section>
      </div>
    </main>
  );
}