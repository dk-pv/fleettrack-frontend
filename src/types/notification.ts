/**
 * In-portal notification (NOT-01…04), API-shaped. Raised by trip lifecycle events
 * (started / delayed / completed) and proof-of-delivery confirmation. `tripId` links back
 * to the originating trip when present. Named `AppNotification` to avoid colliding with the
 * browser's built-in `Notification` global.
 */
export type NotificationType =
  | "TRIP_STARTED"
  | "TRIP_DELAYED"
  | "TRIP_COMPLETED"
  | "POD_UPLOADED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  clientId: string;
  tripId: string | null;
  read: boolean;
  createdAt: string;
}
