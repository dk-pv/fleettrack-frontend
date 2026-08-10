import { Shield } from "lucide-react";

export default function SecuritySettings() {
  return (
    <div className="rounded-lg border border-border bg-background p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Shield className="h-5 w-5 text-muted-foreground" />

        <h2 className="text-xl font-semibold md:text-2xl">
          Security Settings
        </h2>
      </div>

      <p className="mt-4 text-sm text-muted-foreground md:text-base">
        Manage authentication and
        account security
      </p>

      <div className="mt-8 space-y-5">
        {[
          "Current Password",
          "New Password",
          "Confirm Password",
        ].map((item) => (
          <div key={item}>
            <label className="mb-2 block text-sm font-medium">
              {item}
            </label>

            <input
              type="password"
              className="h-12 w-full rounded-xl border border-border bg-muted px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <button className="mt-4 w-full rounded-lg bg-[#0f172a] px-5 py-3 text-sm font-medium text-white sm:w-auto">
          Update Password
        </button>
      </div>
    </div>
  );
}