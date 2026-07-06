"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Route as RouteIcon, Plus } from "lucide-react";

import { useTrips } from "@/hooks/use-trips";
import TripTable from "@/components/trips/trip-table";
import TripFormModal from "@/components/trips/trip-form-modal";
import {
  TripSummaryBucket,
  TRIP_SUMMARY_BUCKETS,
  TRIP_SUMMARY_BUCKET_LABELS,
} from "@/types/trip";

function TripsPageContent() {
  const { trips, loading, permissions, createTrip } = useTrips();
  const [modalOpen, setModalOpen] = useState(false);

  // Drill-down from the dashboard (DSH-01.3): ?status=<bucket> narrows the list.
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const bucket =
    statusParam && statusParam in TRIP_SUMMARY_BUCKETS
      ? (statusParam as TripSummaryBucket)
      : null;

  const visibleTrips = useMemo(() => {
    if (!bucket) return trips;
    const statuses = TRIP_SUMMARY_BUCKETS[bucket];
    return trips.filter((t) => statuses.includes(t.status));
  }, [trips, bucket]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-500/10 p-3">
            <RouteIcon className="h-6 w-6 text-blue-600" />
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight">Trips</h1>
            <p className="mt-1 text-muted-foreground">
              Manage trips, assignments and lifecycle
            </p>
          </div>
        </div>

        {permissions.canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Create Trip
          </button>
        )}
      </div>

      {/* Active drill-down filter (DSH-01.3) */}
      {bucket && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtered by</span>
          <span className="rounded-full bg-muted px-3 py-1 font-medium">
            {TRIP_SUMMARY_BUCKET_LABELS[bucket]}
          </span>
          <Link href="/trips" className="text-primary hover:underline">
            Clear
          </Link>
        </div>
      )}

      {/* Table */}
      <TripTable trips={visibleTrips} loading={loading} />

      {/* Create modal (client only) */}
      {permissions.canCreate && (
        <TripFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={createTrip}
        />
      )}
    </div>
  );
}

export default function TripsPage() {
  // useSearchParams() requires a Suspense boundary for static prerender (Next 16).
  return (
    <Suspense fallback={<div className="p-6">Loading trips...</div>}>
      <TripsPageContent />
    </Suspense>
  );
}
