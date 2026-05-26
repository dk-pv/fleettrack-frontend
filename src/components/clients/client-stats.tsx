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
      const response = await fetch(
        `${API_URL}/clients`,
      );

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

  const admins = users.filter(
    (user) => user.role === "ADMIN",
  ).length;

  const fleetManagers = users.filter(
    (user) =>
      user.role === "FLEET_MANAGER",
  ).length;

  const viewers = users.filter(
    (user) => user.role === "VIEWER",
  ).length;

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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-border bg-background p-5"
        >
          <p className="text-sm text-muted-foreground">
            {item.title}
          </p>

          <h3 className="mt-6 text-4xl font-bold">
            {item.value}
          </h3>
        </div>
      ))}
    </div>
  );
}