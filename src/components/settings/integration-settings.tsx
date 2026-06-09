import { Plug } from "lucide-react";

export default function IntegrationSettings() {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Plug className="h-5 w-5 text-muted-foreground" />

        <h2 className="text-xl font-semibold md:text-2xl">
          Integration Settings
        </h2>
      </div>

      <p className="mt-4 text-sm text-muted-foreground md:text-base">
        Configure third-party
        integrations and APIs
      </p>

      <div className="mt-8 space-y-5">
        {[
          {
            label:
              "Google Maps API Key",

            value:
              "AIzaSy***************",
          },

          {
            label: "Twilio API Key",

            value:
              "TWILIO_***************",
          },

          {
            label:
              "Webhook Endpoint",

            value:
              "https://fleettrack.app/webhooks",
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

        <button className="mt-4 w-full rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white sm:w-auto">
          Save Integrations
        </button>
      </div>
    </div>
  );
}