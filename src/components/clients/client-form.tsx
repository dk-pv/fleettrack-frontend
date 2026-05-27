"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
interface User {
  id: string;

  name: string;

  email: string;

  role: string;
}

interface ClientFormProps {
  buttonText?: string;

  editUser?: User | null;
}

export default function ClientForm({
  buttonText = "Add Client",
  editUser,
}: ClientFormProps) {
  const [name, setName] = useState(editUser?.name || "");

  const [email, setEmail] = useState(editUser?.email || "");

  const [password, setPassword] = useState("");

  const [role, setRole] = useState(editUser?.role || "ADMIN");

  const [loading, setLoading] = useState(false);

  const isEdit = !!editUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const url = isEdit
        ? `${API_URL}/clients/${editUser.id}`
        : `${API_URL}/clients`;

      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(isEdit ? "User updated" : "User added");

        window.location.reload();
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);

      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="mb-2 block text-sm font-medium">Full Name</label>

        <input
          type="text"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-medium">Email Address</label>

        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Role */}
      <div>
        <label className="mb-2 block text-sm font-medium">User Role</label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        >
          <option value="ADMIN">Admin</option>

          <option value="FLEET_MANAGER">Fleet Manager</option>

          <option value="VIEWER">Viewer</option>
        </select>
      </div>

      {/* Password */}
      {!isEdit && (
        <div>
          <label className="mb-2 block text-sm font-medium">Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-3 h-11 rounded-lg bg-[#0f172a] px-5 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        {loading ? "Loading..." : buttonText}
      </button>
    </form>
  );
}
