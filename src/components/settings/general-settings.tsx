import { Globe } from "lucide-react";

export default function GeneralSettings() {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 text-muted-foreground" />

        <h2 className="text-2xl font-semibold">
          General Settings
        </h2>
      </div>

      <p className="mt-4 text-muted-foreground">
        Configure basic application settings
      </p>

      {/* Form */}
      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Company Name
          </label>

          <input
            type="text"
            defaultValue="FleetTrack Inc."
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Timezone
          </label>

          <input
            type="text"
            defaultValue="Asia/Kolkata (GMT+5:30)"
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Language
          </label>

          <input
            type="text"
            defaultValue="English (US)"
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Date Format
          </label>

          <input
            type="text"
            defaultValue="YYYY-MM-DD HH:mm"
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-8 border-t border-border pt-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">
                Auto-refresh Dashboard
              </h4>

              <p className="text-sm text-muted-foreground">
                Automatically update data every 30
                seconds
              </p>
            </div>

            <button className="flex h-6 w-11 items-center rounded-full bg-[#0f172a] px-1">
              <div className="ml-auto h-4 w-4 rounded-full bg-white" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">
                Show Idle Vehicles
              </h4>

              <p className="text-sm text-muted-foreground">
                Display idle vehicles on live
                tracking map
              </p>
            </div>

            <button className="flex h-6 w-11 items-center rounded-full bg-[#0f172a] px-1">
              <div className="ml-auto h-4 w-4 rounded-full bg-white" />
            </button>
          </div>
        </div>

        <button className="mt-8 rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white">
          Save Changes
        </button>
      </div>
    </div>
  );
}