"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Plus, Search } from "lucide-react";

import { useTripRequests } from "@/hooks/use-trip-requests";
import TripRequestTable from "@/components/trip-requests/trip-request-table";
import TripFormModal from "@/components/trips/trip-form-modal";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { createTrip } from "@/services/trip.service";
import {
  TRIP_REQUEST_STATUSES,
  TripRequestStatus,
} from "@/types/trip-request";

type StatusFilter = TripRequestStatus | "ALL";
const FILTERS: StatusFilter[] = ["ALL", ...TRIP_REQUEST_STATUSES];

/**
 * Trip Requests — one role-aware route (D6). ADMIN reviews all clients' requests; a
 * CLIENT sees only its own history. Approve/Reject controls live on the detail page and
 * render for ADMIN only. Real data via useTripRequests → trip-request.service → API.
 */
export default function TripRequestsPage() {
  const { requests, loading, error, role, refresh } = useTripRequests();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  // ADMIN direct trip creation (FLOW B) — opens the shared TripFormModal in
  // admin-create mode. CLIENT never sees this (its request flow lives on /trips).
  const [createOpen, setCreateOpen] = useState(false);

  const isAdmin = role === "ADMIN";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      if (status !== "ALL" && r.status !== status) return false;
      if (!q) return true;
      return (
        (r.reference ?? "").toLowerCase().includes(q) ||
        r.client.name.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q) ||
        (r.vehicle?.vehicleNumber ?? "").toLowerCase().includes(q)
      );
    });
  }, [requests, search, status]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="page-title">Trip Requests</h1>
            <p className="mt-1 text-muted-foreground">
              {isAdmin
                ? "Review and approve trip requests submitted by clients"
                : "Track the status of your submitted trip requests"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* ADMIN-only: create a trip directly (POST /trips), distinct from the
              CLIENT request flow. */}
          {isAdmin && (
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create Trip
            </button>
          )}

          <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm">
            <span className="font-semibold">{filtered.length}</span>{" "}
            <span className="text-muted-foreground">
              request{filtered.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, route, vehicle…"
            className="h-10 w-full rounded-lg border border-border bg-muted/40 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-background"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`h-9 rounded-lg border px-3 text-xs font-semibold uppercase tracking-wide transition-colors ${
                status === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {s === "ALL" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {error && !loading ? (
        <ErrorState message="Couldn't load trip requests." onRetry={refresh} />
      ) : loading ? (
        <TableSkeleton columns={isAdmin ? 7 : 6} rows={8} />
      ) : (
        <TripRequestTable requests={filtered} showClient={isAdmin} />
      )}

      {/* ADMIN direct-create — reuses the shared TripFormModal (admin-create mode),
          submitting through createTrip → POST /trips. Mounted for ADMIN only so a
          CLIENT never triggers the admin-only client lookup. */}
      {isAdmin && (
        <TripFormModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          mode="admin-create"
          onCreate={createTrip}
        />
      )}
    </div>
  );
}
