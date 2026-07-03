"use client";

import { TripEvent } from "@/types/trip";
import TripStatusBadge from "./trip-status-badge";

interface Props {
  events: TripEvent[];
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function TripTimeline({ events }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold">Timeline</h3>

      {events.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No events yet</p>
      ) : (
        <ol className="mt-4">
          {events.map((event, index) => (
            <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
              {/* connector line */}
              {index < events.length - 1 && (
                <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
              )}

              {/* node */}
              <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-background" />

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <TripStatusBadge status={event.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(event.timestamp)}
                  </span>
                </div>

                {event.note && <p className="mt-1 text-sm">{event.note}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
