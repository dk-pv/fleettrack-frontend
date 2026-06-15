"use client";

import { useEffect, useState } from "react";

import { API_URL } from "@/lib/api";

interface User {
  role: string;
}

export default function ClientStats() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setUsers(data.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalUsers = users.length;

  const admins = users.filter((user) => user.role === "ADMIN").length;

  const fleetManagers = users.filter(
    (user) => user.role === "FLEET_MANAGER",
  ).length;

  const viewers = users.filter((user) => user.role === "VIEWER").length;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
    },
    {
      title: "Admins",
      value: admins,
    },
    {
      title: "Fleet Managers",
      value: fleetManagers,
    },
    {
      title: "Viewers",
      value: viewers,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.title}
          className="rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.title}</p>

          <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground leading-none">{item.value}</h3>
        </div>
      ))}
    </div>
  );
}
