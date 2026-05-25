import { Plus, Search, Download } from "lucide-react";

import ClientStats from "@/components/clients/client-stats";
import ClientTable from "@/components/clients/client-table";
import AddClientModal from "@/components/clients/add-client-modal";

export default function ClientsPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Client Management
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage system clients and access permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export */}
          <button className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted">
            <Download className="h-4 w-4" />
            Export
          </button>

          {/* Add User */}
          <AddClientModal>
            <button className="flex h-11 items-center gap-2 rounded-lg bg-[#0f172a] px-5 text-sm font-medium text-white dark:bg-white dark:text-black">
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </AddClientModal>
        </div>
      </div>

      {/* Stats */}
      <ClientStats />

      {/* Search */}
      <div className="rounded-xl border border-border bg-background p-5">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search Clients by name, email, role..."
            className="h-11 w-full rounded-lg border border-border bg-muted pl-10 pr-4 text-sm outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <ClientTable />
    </div>
  );
}
