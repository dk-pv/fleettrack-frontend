import {
  Pencil,
  Trash2,
} from "lucide-react";

import { clients } from "@/data/clients-data";

import ClientRoleBadge from "./client-role-badge";
import ClientStatusBadge from "./client-status-badge";

export default function ClientTable() {
  return (
    <div className="rounded-xl border border-border bg-background">
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-lg font-semibold">
          All Clients (5)
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-4 text-sm font-semibold">
                User Name
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Email
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Role
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Status
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Last Login
              </th>

              <th className="px-5 py-4 text-right text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {clients.map((client) => (
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
                  <ClientRoleBadge
                    role={client.role}
                  />
                </td>

                <td className="px-5 py-5">
                  <ClientStatusBadge
                    status={client.status}
                  />
                </td>

                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {client.lastLogin}
                </td>

                <td className="px-5 py-5">
                  <div className="flex justify-end gap-4">
                    <button>
                      <Pencil className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
                    </button>

                    <button>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}