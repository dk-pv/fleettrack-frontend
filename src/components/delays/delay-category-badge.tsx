"use client";

import { DelayCategory } from "@/types/delay";

const STYLES: Record<DelayCategory, string> = {
  TRAFFIC: "bg-orange-500/10 text-orange-600 border-orange-500/15",
  WEATHER: "bg-sky-500/10 text-sky-600 border-sky-500/15",
  BREAKDOWN: "bg-destructive/10 text-destructive border-destructive/15",
  ACCIDENT: "bg-red-500/10 text-red-600 border-red-500/15",
  LOADING: "bg-amber-500/10 text-amber-600 border-amber-500/15",
  CUSTOMER: "bg-violet-500/10 text-violet-600 border-violet-500/15",
  DOCUMENTATION: "bg-blue-500/10 text-blue-600 border-blue-500/15",
  OTHER: "bg-muted text-muted-foreground border-border",
};

export default function DelayCategoryBadge({
  category,
}: {
  category: DelayCategory;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STYLES[category]}`}
    >
      {category}
    </span>
  );
}
