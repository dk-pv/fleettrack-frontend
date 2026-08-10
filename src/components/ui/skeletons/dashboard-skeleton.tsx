import { Skeleton } from "@/components/ui/skeleton";
import { StatsCardSkeleton } from "./card-skeleton";
import { MapSkeleton } from "./map-skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {/* Trip summary (DSH-01) */}
      <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Delivery performance (DSH-04) */}
      <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Stats */}
      <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex h-[300px] items-center justify-center rounded-lg border border-border bg-card p-6">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>

        <div className="min-w-0 rounded-lg border border-border bg-card p-6 xl:col-span-2">
          <Skeleton className="mb-6 h-6 w-48" />
          <div className="flex h-48 items-end justify-between gap-2">
            {/* Static heights — deterministic so SSR and client match. */}
            {[55, 80, 45, 90, 60, 40, 75].map((h, i) => (
              <Skeleton key={i} className="w-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Vehicles & Live Operations placeholders */}
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="h-[400px] rounded-lg border border-border bg-card">
          <div className="border-b border-border p-6">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-4 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
        <MapSkeleton />
      </div>
    </div>
  );
}
