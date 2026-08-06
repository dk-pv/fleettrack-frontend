import { TableSkeleton } from "@/components/ui/skeletons/table-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-10 w-48 bg-muted animate-pulse rounded-md mb-2"></div>
          <div className="h-5 w-64 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TableSkeleton rows={5} />
        </div>
        <div className="lg:col-span-2">
           <div className="h-[600px] w-full bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}
