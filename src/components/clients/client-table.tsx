"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import AddClientModal from "./add-client-modal";
import DeleteClientDialog from "./DeleteClientDialog";
import { toast } from "sonner";


interface Client {
  id: string;
  name: string;
  email: string;
  apiUrl: string;
  createdAt: string;
}

interface Props {
  searchQuery?: string;
}

export default function ClientTable({ searchQuery = "" }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchClients = async () => {
    const res = await apiFetch("/clients");
    const data = await res.json();
    setClients(data.clients || []);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await apiFetch(`/clients/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Client deleted");
        fetchClients();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [clients, searchQuery]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Name
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Email
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                API URL
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Created
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No clients found
                </td>
              </tr>
            ) : (
              filtered.map((client) => (
                <tr
                  key={client.id}
                  className="
                    border-b border-border
                    hover:bg-muted/40
                    transition-colors
                  "
                >
                  <td className="px-6 py-4 font-medium">{client.name}</td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {client.email}
                  </td>

                  <td className="px-6 py-4 max-w-[420px]">
                    <div
                      className="truncate text-muted-foreground"
                      title={client.apiUrl}
                    >
                      {client.apiUrl}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <AddClientModal editUser={client}>
                        <button className="text-primary text-sm font-medium hover:underline">
                          Edit
                        </button>
                      </AddClientModal>

                      <button
                        onClick={() => setDeleteId(client.id)}
                        className="text-red-500 text-sm font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteClientDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
