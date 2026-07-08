"use client";

import { Bell, CheckCheck } from "lucide-react";

import { useNotifications } from "@/hooks/use-notifications";
import NotificationItem from "@/components/notifications/notification-item";

/**
 * Notifications page (NOT-04.2 / NOT-04.3). Full list of the caller's scoped notifications
 * with mark-as-read (per item + all). Reuses the same hook and row component as the navbar
 * bell — one notification data flow, one row component.
 */
export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markRead, markAllRead } =
    useNotifications();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Notifications</h1>
            <p className="mt-1 text-muted-foreground">
              Trip and delivery activity
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Loading...
          </p>
        ) : notifications.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No notifications yet
          </p>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={markRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
