/**
 * Queues for notification delivery
 */
export const NotificationType = {
  EMAIL: 'email',
  POST_EVENT_REMINDER: 'post-event-reminder',
} as const;

export enum NotificationPriority {
  LOW = 4,
  MEDIUM = 3,
  HIGH = 2,
}
