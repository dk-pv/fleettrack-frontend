"use client";

import { useEffect } from "react";

/**
 * Route-group error boundary for the dashboard. Without this, any uncaught client
 * error (e.g. a Google Maps failure throwing inside an effect) unmounts the whole
 * route and shows Next.js's generic error screen. This catches it and offers a retry
 * so a single failing widget can't take the entire page down.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm font-medium text-foreground">
        This page couldn&apos;t load
      </p>
      <p className="text-xs text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-1 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-all cursor-pointer shadow-sm outline-none"
      >
        Try again
      </button>
    </div>
  );
}
