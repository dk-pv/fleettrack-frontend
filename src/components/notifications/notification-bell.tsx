"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";
import NotificationItem from "./notification-item";
import EmptyState from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const PREVIEW_COUNT = 6;

/**
 * Navbar notification bell (NOT-04.2). Shows an unread badge and a dropdown preview of the
 * most recent notifications, refreshed live via the shared tracking socket (through the
 * hook). "View all" links to the full page. Reuses the shared DropdownMenu, and the same
 * hook + row component as the page — one notification data flow, one UI.
 */
export default function NotificationBell() {
  const { notifications, unreadCount, loading, error, markRead, markAllRead } =
    useNotifications();

  const preview = notifications.slice(0, PREVIEW_COUNT);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error && preview.length === 0 ? (
            <EmptyState title="Couldn't load notifications" className="py-6" />
          ) : preview.length === 0 ? (
            <EmptyState title="No notifications yet" className="py-6" />
          ) : (
            <div className="divide-y divide-border">
              {preview.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={markRead}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border">
          <Link
            href="/notifications"
            className="block px-4 py-2.5 text-center text-xs font-medium text-primary hover:bg-muted/60"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
