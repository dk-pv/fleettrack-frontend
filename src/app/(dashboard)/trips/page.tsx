"use client";

import { useState } from "react";
import { Route as RouteIcon, Plus } from "lucide-react";

import { useTrips } from "@/hooks/use-trips";
import TripTable from "@/components/trips/trip-table";
import TripFormModal from "@/components/trips/trip-form-modal";

export default function TripsPage() {
  const { trips, loading, permissions, createTrip } = useTrips();
  const [modalOpen, setModalOpen] = useState(false);

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

      {/* Table */}
      <TripTable trips={trips} loading={loading} />

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
