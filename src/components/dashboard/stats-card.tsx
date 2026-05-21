import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  color?: "default" | "green" | "red";
}

export default function StatsCard({
  title,
  value,
  description,
  color = "default",
}: StatsCardProps) {
  return (
    <Card
      className={`rounded-2xl border p-5 shadow-none ${
        color === "green"
          ? "border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-500/10"
          : color === "red"
            ? "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10"
            : ""
      }`}
    >
      <h3 className="text-sm font-medium text-muted-foreground">
        {title}
      </h3>

      <div className="mt-7">
        <h2 className="text-4xl font-bold">
          {value}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </Card>
  );
}