import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder for the tracking vehicle list (initial API load only — never for
 * socket updates). Mirrors the real list: header + search + a few vehicle cards.
 */
export function TrackingListSkeleton() {
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="space-y-3 border-b border-border px-4 py-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>

      <div className="flex-1 space-y-2.5 p-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-lg border border-border p-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
