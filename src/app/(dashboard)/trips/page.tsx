"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Route as RouteIcon, Plus } from "lucide-react";

import { useTrips } from "@/hooks/use-trips";
import { useTripRequests } from "@/hooks/use-trip-requests";
import TripTable from "@/components/trips/trip-table";
import TripFormModal from "@/components/trips/trip-form-modal";
import { PageHeaderSkeleton } from "@/components/ui/skeletons/page-header-skeleton";
import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import {
  TripSummaryBucket,
  TRIP_SUMMARY_BUCKETS,
  TRIP_SUMMARY_BUCKET_LABELS,
} from "@/types/trip";

function TripsPageContent() {
  const { trips, loading, error, permissions, refetch } = useTrips();
  // CLIENT trip creation now submits a trip REQUEST for admin approval (no Trip is
  // created directly) — the same form, routed through the trip-requests workflow.
  const { create: createTripRequest } = useTripRequests();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-3">
            <RouteIcon className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="page-title">Trips</h1>
            <p className="mt-1 text-muted-foreground">
              Manage trips, assignments and lifecycle
            </p>
          </div>
        </div>

        {permissions.canCreate && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Request Trip
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
      {error && !loading ? (
        <ErrorState message="Couldn't load trips." onRetry={refetch} />
      ) : (
        <TripTable trips={visibleTrips} loading={loading} />
      )}

      {/* Request modal (client only) — submits a trip request for admin approval */}
      {permissions.canCreate && (
        <TripFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onCreate={createTripRequest}
        />
      )}
    </div>
  );
}

export default function TripsPage() {
  // useSearchParams() requires a Suspense boundary for static prerender (Next 16).
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <PageHeaderSkeleton action />
          <TableSkeleton columns={6} rows={8} />
        </div>
      }
    >
      <TripsPageContent />
    </Suspense>
  );
}
