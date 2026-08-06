import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Truck, Activity, AlertTriangle, type LucideIcon } from "lucide-react";

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

  const badgeColors = color === "green"
    ? "bg-success/10 text-success border-success/10"
    : color === "red"
      ? "bg-destructive/10 text-destructive border-destructive/10"
      : "bg-muted text-muted-foreground border-border";

  const card = (
    <Card
      className={`h-full flex flex-col justify-between rounded-2xl border p-6 xl:p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        color === "green"
          ? "border-success/15 bg-success/5 dark:border-success/10 dark:bg-success/5"
          : color === "red"
            ? "border-destructive/15 bg-destructive/5 dark:border-destructive/10 dark:bg-destructive/5"
            : "border-border bg-card shadow-xs"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[18px] font-semibold text-muted-foreground leading-tight">
          {title}
        </h3>

        <div className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-lg border ${badgeColors}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-[36px] xl:text-[42px] font-extrabold tracking-tight text-foreground leading-none">
          {value}
        </h2>

        <p className="mt-2 text-[15px] text-muted-foreground font-medium">
          {description}
        </p>
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}