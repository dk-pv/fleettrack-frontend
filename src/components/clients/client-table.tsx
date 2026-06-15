"use client";

import { Pencil, Trash2 } from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/fetcher";

import { useAuthStore } from "@/store/auth-store";

import ClientRoleBadge from "./client-role-badge";

import ClientStatusBadge from "./client-status-badge";

import AddClientModal from "./add-client-modal";

interface User {
  id: string;

  name: string;

  email: string;

  role: string;

  createdAt: string;
}

interface ClientTableProps {
  searchQuery?: string;
}

export default function ClientTable({ searchQuery = "" }: ClientTableProps) {
  const [users, setUsers] = useState<User[]>([]);

  const { user } = useAuthStore();

  const fetchUsers = async () => {
    try {
      const response = await apiFetch("/clients");

      const data = await response.json();

      setUsers(data.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (searchQuery.trim() === "") {
      return users;
    }

    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const deleteUser = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this user?");

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await apiFetch(`/clients/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("User deleted");

        fetchUsers();
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.log(error);

      alert("Server error");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">All Clients ({filteredUsers.length})</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-xs border-b border-border z-10">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Name</th>

              <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>

              <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>

              <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>

              <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created</th>

              {user?.role === "ADMIN" && (
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  No clients found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((client) => (
                <tr
                  key={client.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-4 text-sm font-bold text-foreground">
                    {client.name}
                  </td>

                  <td className="px-5 py-4 text-xs font-semibold text-muted-foreground">
                    {client.email}
                  </td>

                  <td className="px-5 py-4">
                    <ClientRoleBadge role={client.role} />
                  </td>

                  <td className="px-5 py-4">
                    <ClientStatusBadge status="Active" />
                  </td>

                  <td className="px-5 py-4 text-xs text-muted-foreground font-medium">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>

                  {user?.role === "ADMIN" && (
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <AddClientModal editUser={client}>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </AddClientModal>

                        <button 
                          onClick={() => deleteUser(client.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-destructive/10 bg-destructive/5 hover:bg-destructive/15 text-destructive transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
