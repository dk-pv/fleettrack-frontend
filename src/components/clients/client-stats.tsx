import { clientStats } from "@/data/clients-data";

export default function ClientStats() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {clientStats.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-border bg-background p-5"
        >
          <p className="text-sm text-muted-foreground">
            {item.title}
          </p>

          <h3 className="mt-6 text-4xl font-bold">
            {item.value}
          </h3>
        </div>
      ))}
    </div>
  );
}