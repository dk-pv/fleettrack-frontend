import { Plug } from "lucide-react";

export default function IntegrationSettings() {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="flex items-center gap-3">
        <Plug className="h-5 w-5 text-muted-foreground" />

        <h2 className="text-2xl font-semibold">
          Integration Settings
        </h2>
      </div>

      <p className="mt-4 text-muted-foreground">
        Configure third-party integrations and APIs
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Google Maps API Key
          </label>

          <input
            type="text"
            defaultValue="AIzaSy***************"
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Twilio API Key
          </label>

          <input
            type="text"
            defaultValue="TWILIO_***************"
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Webhook Endpoint
          </label>

          <input
            type="text"
            defaultValue="https://fleettrack.app/webhooks"
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>

        <button className="mt-4 rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white">
          Save Integrations
        </button>
      </div>
    </div>
  );
}