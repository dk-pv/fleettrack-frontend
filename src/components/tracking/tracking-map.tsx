import { Minus, Plus, LocateFixed } from "lucide-react";
import { vehicles } from "@/data/tracking-data";

export default function TrackingMap() {
  const movingCount = vehicles.filter((v) => v.status === "Moving").length;
  const offlineCount = vehicles.filter((v) => v.status === "Offline").length;

  return (
    <div className="relative h-[calc(100vh-64px)] overflow-hidden">
      {/* Live Tracking Badge */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-md dark:bg-[#1f2937]">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium">Live Tracking</span>
      </div>

      {/* Vintage World Map */}
      <img
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop"
        alt="World Map"
        className="h-full w-full object-cover"
      />

      {/* Bottom Stats */}
      <div className="absolute bottom-5 left-5 z-10 rounded-2xl bg-white px-5 py-4 shadow-lg dark:bg-[#1f2937]">
        <div className="flex gap-7">
          <div>
            <p className="text-2xl font-bold text-green-500">{movingCount}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Moving</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-red-500">{offlineCount}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Offline</p>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-5 right-5 z-10 flex flex-col gap-2.5">
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-colors hover:bg-muted dark:bg-[#1f2937] dark:hover:bg-[#374151]">
          <Plus className="h-4 w-4" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-colors hover:bg-muted dark:bg-[#1f2937] dark:hover:bg-[#374151]">
          <Minus className="h-4 w-4" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md transition-colors hover:bg-muted dark:bg-[#1f2937] dark:hover:bg-[#374151]">
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}