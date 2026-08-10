import Link from "next/link";
import { Truck, Activity, AlertTriangle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  color?: "default" | "green" | "red";
  /** Overrides the color-derived icon (e.g. a trip icon on the dashboard). */
  icon?: LucideIcon;
  /** When set, the whole card links here — used for dashboard drill-down. */
  href?: string;
}

export default function StatsCard({
  title,
  value,
  description,
  color = "default",
  icon,
  href,
}: StatsCardProps) {
  const Icon = icon
    ? icon
    : color === "green"
      ? Activity
      : color === "red"
        ? AlertTriangle
        : Truck;

  // Accent is reserved for the icon + a subtle border tint — the card body stays
  // neutral so the whole dashboard doesn't read as a wall of coloured cards.
  const iconColors =
    color === "green"
      ? "bg-success/10 text-success border-success/15"
      : color === "red"
        ? "bg-destructive/10 text-destructive border-destructive/15"
        : "bg-muted text-muted-foreground border-border";

  const card = (
    <div
      className={cn(
        "flex h-full flex-col justify-between gap-4 rounded-lg border bg-card p-5 transition-colors",
        color === "green"
          ? "border-success/20"
          : color === "red"
            ? "border-destructive/20"
            : "border-border",
        href && "hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[13px] font-medium leading-tight text-muted-foreground">
          {title}
        </h3>

        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
            iconColors,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div>
        <div className="text-2xl font-semibold leading-none tracking-tight text-foreground tabular-nums">
          {value}
        </div>

        <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}
