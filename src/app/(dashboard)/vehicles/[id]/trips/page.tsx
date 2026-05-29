"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Route,
  Clock3,
  MapPin,
} from "lucide-react";

const trips = [
  {
    id: 1,
    start: "Trivandrum",
    end: "Kochi",
    distance: "245 km",
    duration: "5h 20m",
    date: "29 May 2026",
    status: "Completed",
  },

  {
    id: 2,
    start: "Kochi",
    end: "Thrissur",
    distance: "98 km",
    duration: "2h 10m",
    date: "28 May 2026",
    status: "Completed",
  },

  {
    id: 3,
    start: "Thrissur",
    end: "Calicut",
    distance: "132 km",
    duration: "3h 05m",
    date: "27 May 2026",
    status: "Completed",
  },
];

export default function TripHistoryPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Back */}
      <Link
        href="/vehicles"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />

        Back to Vehicles
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-500/10 p-3">
          <Route className="h-6 w-6 text-blue-600" />
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Trip History
          </h1>

          <p className="mt-1 text-muted-foreground">
            Vehicle trip history and travel records
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-4 text-sm font-semibold">
                Route
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Distance
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Duration
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Date
              </th>

              <th className="px-5 py-4 text-sm font-semibold">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {trips.map((trip) => (
              <tr
                key={trip.id}
                className="border-b border-border last:border-none"
              >
                {/* Route */}
                <td className="px-5 py-5">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-blue-600" />

                    <div>
                      <h4 className="text-sm font-semibold">
                        {trip.start}
                      </h4>

                      <p className="mt-1 text-xs text-muted-foreground">
                        to {trip.end}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Distance */}
                <td className="px-5 py-5 text-sm font-medium">
                  {trip.distance}
                </td>

                {/* Duration */}
                <td className="px-5 py-5">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock3 className="h-4 w-4 text-muted-foreground" />

                    {trip.duration}
                  </div>
                </td>

                {/* Date */}
                <td className="px-5 py-5 text-sm text-muted-foreground">
                  {trip.date}
                </td>

                {/* Status */}
                <td className="px-5 py-5">
                  <span className="inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
                    {trip.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
