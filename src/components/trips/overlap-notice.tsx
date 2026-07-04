import { OverlapConflict } from "@/types/trip";

function formatWindow(startISO: string, endISO: string) {
  const opts: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  };
  const start = new Date(startISO).toLocaleString(undefined, opts);
  const end = new Date(endISO).toLocaleString(undefined, opts);
  return `${start} → ${end}`;
}

interface Props {
  /** Resource name, e.g. "Vehicle" or "Driver". */
  label: string;
  /** Render only when the resource is selected and the schedule is valid. */
  show: boolean;
  checking: boolean;
  hasOverlap: boolean;
  conflicts: OverlapConflict[];
}

/**
 * Tri-state availability notice shared by vehicle and driver overlap validation:
 * checking → conflict list → available.
 */
export default function OverlapNotice({
  label,
  show,
  checking,
  hasOverlap,
  conflicts,
}: Props) {
  if (!show) return null;

  const resource = label.toLowerCase();

  if (checking) {
    return (
      <p className="text-xs text-muted-foreground">
        Checking {resource} availability…
      </p>
    );
  }

  if (hasOverlap) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
        <p className="text-sm font-medium text-destructive">
          This {resource} is already booked for an overlapping schedule:
        </p>
        <ul className="mt-2 space-y-1">
          {conflicts.map((c) => (
            <li key={c.tripId} className="text-xs text-destructive/90">
              {c.reference} · {formatWindow(c.scheduledStart, c.scheduledEnd)} ·{" "}
              {c.status}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-success">
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      {label} is available for this schedule.
    </p>
  );
}
