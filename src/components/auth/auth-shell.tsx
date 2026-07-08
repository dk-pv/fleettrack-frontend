import { Truck } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * Shared two-column frame for every auth page (login / forgot / reset), so they are
 * visually identical by construction. Left is the brand panel (hidden below `lg`);
 * right is a centered card holding the page's form. Fully tokenized + dark-mode aware.
 */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-primary/80 p-12 text-primary-foreground lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-primary-foreground/5 blur-3xl" />

        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15">
            <Truck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">FleetTrack</h1>
            <p className="mt-1 text-primary-foreground/70">
              GPS Fleet Monitoring Platform
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight">
            Manage Your Fleet
            <br />
            Smarter &amp; Faster
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary-foreground/80">
            Monitor vehicles, manage drivers, track live locations and optimize
            fleet operations from one unified dashboard.
          </p>
        </div>

        <p className="relative text-sm text-primary-foreground/60">
          © 2026 FleetTrack. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center p-6 sm:p-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            </div>

            <div className="mt-8">{children}</div>

            {footer && (
              <div className="mt-6 border-t border-border pt-6">{footer}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
