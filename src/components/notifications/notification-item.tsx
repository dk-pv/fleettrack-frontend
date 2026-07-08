"use client";

import Link from "next/link";
import {
  Truck,
  Clock,
  CheckCircle2,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";

import { AppNotification, NotificationType } from "@/types/notification";

interface Props {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
}

const ICON: Record<NotificationType, LucideIcon> = {
  TRIP_STARTED: Truck,
  TRIP_DELAYED: Clock,
  TRIP_COMPLETED: CheckCircle2,
  POD_UPLOADED: PackageCheck,
};

const ICON_TONE: Record<NotificationType, string> = {
  TRIP_STARTED: "text-blue-600 bg-blue-500/10",
  TRIP_DELAYED: "text-orange-600 bg-orange-500/10",
  TRIP_COMPLETED: "text-success bg-success/10",
  POD_UPLOADED: "text-primary bg-primary/10",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * One notification row, shared by the navbar bell dropdown and the notifications page.
 * Clicking marks it read (once) and, when the notification links a trip, navigates there.
 */
export default function NotificationItem({ notification, onMarkRead }: Props) {
  const Icon = ICON[notification.type];

  const handleClick = () => {
    if (!notification.read) onMarkRead(notification.id);
  };

  const body = (
    <div
      className={`flex gap-3 px-4 py-3 transition-colors hover:bg-muted/60 ${
        notification.read ? "" : "bg-primary/5"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ICON_TONE[notification.type]}`}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{notification.title}</p>
          {!notification.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  if (notification.tripId) {
    return (
      <Link
        href={`/trips/${notification.tripId}`}
        onClick={handleClick}
        className="block"
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="block w-full text-left"
    >
      {body}
    </button>
  );
}
