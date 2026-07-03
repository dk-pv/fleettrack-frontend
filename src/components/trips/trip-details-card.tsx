"use client";

import { Trip } from "@/types/trip";

interface Props {
  trip: Trip;
}

function formatDateTime(iso: string | null) {
  return iso ? new Date(iso).toLocaleString() : "—";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium sm:text-right">{value}</span>
    </div>
  );
}

export default function TripDetailsCard({ trip }: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">{trip.reference}</h2>
        <p className="text-sm text-muted-foreground">
          {trip.origin} → {trip.destination}
        </p>
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <Row label="Pickup address" value={trip.origin} />
        <Row label="Delivery address" value={trip.destination} />
        <Row label="Vehicle" value={trip.vehicle?.vehicleNumber ?? "—"} />
        <Row label="Driver" value={trip.driverName ?? "—"} />
        <Row label="Planned start" value={formatDateTime(trip.scheduledStart)} />
        <Row label="Planned end" value={formatDateTime(trip.scheduledEnd)} />
        <Row
          label="Distance"
          value={trip.distanceKm ? `${trip.distanceKm} km` : "—"}
        />
        <Row label="Notes" value={trip.notes ?? "—"} />
      </div>

      {trip.stops.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">
            Stops ({trip.stops.length})
          </span>
          <ol className="space-y-1">
            {trip.stops.map((stop) => (
              <li key={stop.id} className="text-sm">
                <span className="mr-2 text-muted-foreground">
                  {stop.sequence}.
                </span>
                {stop.address}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
