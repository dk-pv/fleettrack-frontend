import { Globe } from "lucide-react";

export default function GeneralSettings() {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 md:p-6">
      {/* Header */}

      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 text-muted-foreground" />

        <h2 className="text-xl font-semibold md:text-2xl">
          General Settings
        </h2>
      </div>

      <p className="mt-4 text-sm text-muted-foreground md:text-base">
        Configure basic application
        settings
      </p>

      {/* Form */}

      <div className="mt-6 space-y-5">
        {[
          {
            label: "Company Name",
            value: "FleetTrack Inc.",
          },

          {
            label: "Timezone",
            value:
              "Asia/Kolkata (GMT+5:30)",
          },

          {
            label: "Language",
            value: "English (US)",
          },

          {
            label: "Date Format",
            value:
              "YYYY-MM-DD HH:mm",
          },
        ].map((item) => (
          <div key={item.label}>
            <label className="mb-2 block text-sm font-medium">
              {item.label}
            </label>

            <input
              type="text"
              defaultValue={item.value}
              className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      {/* Toggles */}

      <div className="mt-8 border-t border-border pt-6">
        <div className="space-y-6">
          {[
            {
              title:
                "Auto-refresh Dashboard",

              description:
                "Automatically update data every 30 seconds",
            },

            {
              title:
                "Show Idle Vehicles",

              description:
                "Display idle vehicles on live tracking map",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h4 className="font-medium">
                  {item.title}
                </h4>

                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <button className="flex h-6 w-11 items-center rounded-full bg-[#0f172a] px-1">
                <div className="ml-auto h-4 w-4 rounded-full bg-white" />
              </button>
            </div>
          ))}
        </div>

        <button className="mt-8 w-full rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white sm:w-auto">
          Save Changes
        </button>
      </div>
    </div>
  );
}