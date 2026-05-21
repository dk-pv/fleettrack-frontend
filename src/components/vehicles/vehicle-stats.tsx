import { vehicleStats } from "@/data/vehicles-data";

export default function VehicleStats() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {vehicleStats.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-border bg-background p-5"
        >
          <p className="text-sm text-muted-foreground">
            {item.title}
          </p>

          <h3
            className={`mt-3 text-3xl font-bold ${
              item.color === "green"
                ? "text-green-600"
                : item.color === "yellow"
                  ? "text-yellow-600"
                  : item.color === "red"
                    ? "text-red-500"
                    : ""
            }`}
          >
            {item.value}
          </h3>
        </div>
      ))}
    </div>
  );
}