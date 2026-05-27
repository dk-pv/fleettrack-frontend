"use client";

import { Pencil, Trash2 } from "lucide-react";

import { useEffect, useState } from "react";

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

export default function ClientTable() {
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
    <div className="rounded-xl border border-border bg-background">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-lg font-semibold">All Clients ({users.length})</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-4 text-sm font-semibold">User Name</th>

              <th className="px-5 py-4 text-sm font-semibold">Email</th>

              <th className="px-5 py-4 text-sm font-semibold">Role</th>

              <th className="px-5 py-4 text-sm font-semibold">Status</th>

              <th className="px-5 py-4 text-sm font-semibold">Created</th>

              {user?.role === "ADMIN" && (
                <th className="px-5 py-4 text-right text-sm font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {users.map((client) => (
              <tr
                key={client.id}
                className="border-b border-border last:border-none"
              >
                <td className="px-5 py-5 text-sm font-semibold">
                  {client.name}
                </td>

                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {client.email}
                </td>

                <td className="px-5 py-5">
                  <ClientRoleBadge role={client.role} />
                </td>

                <td className="px-5 py-5">
                  <ClientStatusBadge status="Active" />
                </td>

                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {new Date(client.createdAt).toLocaleDateString()}
                </td>

                {user?.role === "ADMIN" && (
                  <td className="px-5 py-5">
                    <div className="flex justify-end gap-4">
                      <AddClientModal editUser={client}>
                        <button>
                          <Pencil className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                        </button>
                      </AddClientModal>

                      <button onClick={() => deleteUser(client.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
