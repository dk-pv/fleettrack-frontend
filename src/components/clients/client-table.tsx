"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import AddClientModal from "./add-client-modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";
import { ErrorState } from "@/components/ui/error-state";

interface Client {
  id: string;
  name: string;
  email: string;
  apiUrl: string;
  createdAt: string;
}

interface Props {
  searchQuery?: string;
  /** Bumped by the page-level Add modal so the table refetches its own data. */
  refreshKey?: number;
}

export default function ClientTable({ searchQuery = "", refreshKey = 0 }: Props) {
  const [clients, setClients] = useState<Client[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mounted = useRef(false);

  // `silent` refetches (after a mutation or a parent refreshKey bump) update the
  // table in place; only the very first load shows the skeleton.
  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(false);
    try {
      const res = await apiFetch("/clients");
      // apiFetch resolves for HTTP errors too — treat a non-ok status as a failure
      // so a 500 surfaces the error state (with retry) instead of a false "empty".
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
      if (!silent) setError(true);
      else toast.error("Couldn't refresh clients");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load(mounted.current);
    mounted.current = true;
  }, [refreshKey]);

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const res = await apiFetch(`/clients/${deleteId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Client deleted");
        setDeleteId(null);
        await load(true);
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [clients, searchQuery]);

  if (loading) return <TableSkeleton columns={5} rows={8} />;

  if (error)
    return (
      <ErrorState message="Couldn't load clients." onRetry={() => load()} />
    );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Name
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                API URL
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Created
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                  <td className="px-4 py-3.5 font-semibold text-sm">{client.name}</td>

                  <td className="px-4 py-3.5 text-sm text-muted-foreground">
                    {client.email}
                  </td>

                  <td className="px-4 py-3.5 max-w-[420px]">
                    <div
                      className="truncate text-sm text-muted-foreground"
                      title={client.apiUrl}
                    >
                      {client.apiUrl}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-sm text-muted-foreground">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex gap-4">
                      <AddClientModal
                        editUser={client}
                        onSuccess={() => load(true)}
                      >
                        <button className="text-primary text-sm font-medium hover:underline">
                          Edit
                        </button>
                      </AddClientModal>

                      <button
                        onClick={() => setDeleteId(client.id)}
                        className="text-destructive text-sm font-medium hover:underline"
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

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Client?"
        description="This action cannot be undone. This will permanently delete the client and related data."
        loading={deleting}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
