import { Shield } from "lucide-react";

export default function SecuritySettings() {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-muted-foreground" />

        <h2 className="text-2xl font-semibold">
          Security Settings
        </h2>
      </div>

      <p className="mt-4 text-muted-foreground">
        Manage authentication and account security
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Current Password
          </label>

          <input
            type="password"
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            New Password
          </label>

          <input
            type="password"
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Confirm Password
          </label>

          <input
            type="password"
            className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none"
          />
        </div>

        <button className="mt-4 rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white">
          Update Password
        </button>
      </div>
    </div>
  );
}