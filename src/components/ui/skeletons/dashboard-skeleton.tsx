import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "./card-skeleton";
import { MapSkeleton } from "./map-skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* Trip summary (DSH-01) */}
      <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Delivery performance (DSH-04) */}
      <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Stats */}
      <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
        {/* FleetStatusChart Placeholder */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs h-[300px] flex items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>

        {/* WeeklyActivityChart Placeholder */}
        <div className="min-w-0 xl:col-span-2 rounded-xl border border-border bg-card p-6 shadow-xs h-[300px]">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="flex items-end justify-between h-48 gap-2">
            {/* Static heights — deterministic so SSR and client match (no hydration mismatch). */}
            {[55, 80, 45, 90, 60, 40, 75].map((h, i) => (
              <Skeleton key={i} className="w-full" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Vehicles & Live Operations placeholders */}
      <div className="grid min-w-0 grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card shadow-xs h-[400px]">
          <div className="border-b border-border p-6"><Skeleton className="h-6 w-48" /></div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </div>
        <MapSkeleton />
      </div>
    </div>
  );
}
