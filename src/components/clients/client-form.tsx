"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";

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
        toast.success(isEdit ? "User updated" : "User added");

        window.location.reload();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      console.log(error);

      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Name */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>

        <input
          type="text"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>

        <input
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Role */}
      <div>
        <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">User Role</label>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <option value="ADMIN">Admin</option>

          <option value="FLEET_MANAGER">Fleet Manager</option>

          <option value="VIEWER">Viewer</option>
        </select>
      </div>

      {/* Password */}
      {!isEdit && (
        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}

      {/* Submit */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="h-10 w-full sm:w-auto rounded-lg bg-primary hover:bg-primary/90 px-5 text-xs font-semibold text-primary-foreground shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Saving..." : buttonText}
        </button>
      </div>
    </form>
  );
}
