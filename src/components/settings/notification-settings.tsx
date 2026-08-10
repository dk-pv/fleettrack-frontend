import { Bell } from "lucide-react";

export default function NotificationSettings() {
  return (
    <div className="rounded-lg border border-border bg-background p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-muted-foreground" />

        <h2 className="text-xl font-semibold md:text-2xl">
          Notification Settings
        </h2>
      </div>

      <p className="mt-4 text-sm text-muted-foreground md:text-base">
        Configure system notifications
        and alerts
      </p>

      <div className="mt-8 space-y-6">
        {[
          "Email Alerts",
          "SMS Notifications",
          "Push Notifications",
          "Maintenance Alerts",
        ].map((item) => (
          <div
            key={item}
            className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h4 className="font-medium">
                {item}
              </h4>

              <p className="text-sm text-muted-foreground">
                Enable{" "}
                {item.toLowerCase()}
              </p>
            </div>

            <button className="flex h-6 w-11 items-center rounded-full bg-[#0f172a] px-1">
              <div className="ml-auto h-4 w-4 rounded-full bg-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}