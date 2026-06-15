import { Card } from "@/components/ui/card";
import { Truck, Activity, AlertTriangle } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  color?: "default" | "green" | "red";
}

export default function StatsCard({
  title,
  value,
  description,
  color = "default",
}: StatsCardProps) {
  const Icon = color === "green"
    ? Activity
    : color === "red"
      ? AlertTriangle
      : Truck;

  const badgeColors = color === "green"
    ? "bg-success/10 text-success border-success/10"
    : color === "red"
      ? "bg-destructive/10 text-destructive border-destructive/10"
      : "bg-muted text-muted-foreground border-border";

  return (
    <Card
      className={`rounded-2xl border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
        color === "green"
          ? "border-success/15 bg-success/5 dark:border-success/10 dark:bg-success/5"
          : color === "red"
            ? "border-destructive/15 bg-destructive/5 dark:border-destructive/10 dark:bg-destructive/5"
            : "border-border bg-card shadow-xs"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>

        <div className={`flex h-8.5 w-8.5 items-center justify-center rounded-lg border text-sm font-medium ${badgeColors}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-3.5xl font-extrabold tracking-tight text-foreground leading-none">
          {value}
        </h2>

        <p className="mt-2 text-xs text-muted-foreground font-medium">
          {description}
        </p>
      </div>
    </Card>
  );
}