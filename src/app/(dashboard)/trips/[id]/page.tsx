"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useTrip } from "@/hooks/use-trip";
import TripDetailsCard from "@/components/trips/trip-details-card";
import TripStatusControls from "@/components/trips/trip-status-controls";
import TripTimeline from "@/components/trips/trip-timeline";
import TripRouteMap from "@/components/trips/trip-route-map";
import TripProgressCard from "@/components/trips/trip-progress";

export default function TripDetailPage() {
  const params = useParams();
  const id = String(params.id);

  const {
    trip,
    timeline,
    route,
    progress,
    vehiclePosition,
    live,
    loading,
    error,
    permissions,
    changeStatus,
  } = useTrip(id);

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/trips"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Trips
      </Link>

      {loading ? (
        <p className="text-muted-foreground">Loading trip...</p>
      ) : error || !trip ? (
        <p className="text-muted-foreground">{error ?? "Trip not found"}</p>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Trip {trip.reference}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {trip.origin} → {trip.destination}
            </p>
          </div>

          <TripRouteMap points={route} vehiclePosition={vehiclePosition} />

          <TripProgressCard progress={progress} live={live} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <TripDetailsCard trip={trip} />
              <TripStatusControls
                trip={trip}
                permissions={permissions}
                onChange={changeStatus}
              />
            </div>

            <div className="lg:col-span-1">
              <TripTimeline events={timeline} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
