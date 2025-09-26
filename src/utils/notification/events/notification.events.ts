/**
 * Event definitions for the notification system
 * These events replace BullMQ job types
 */

import { EmailType } from 'src/utils/notification/email/email.enum';

export class EmailNotificationEvent {
  constructor(
    public readonly to: string,
    public readonly type: EmailType,
    public readonly context: Record<string, any>,
    public readonly options?: {
      priority?: number;
      delay?: number;
      attempts?: number;
    },
  ) {}
}

// Event names - using consistent naming convention
export const NOTIFICATION_EVENTS = {
  EMAIL_SEND: 'notification.email.send',
} as const;

export type NotificationEventNames =
  (typeof NOTIFICATION_EVENTS)[keyof typeof NOTIFICATION_EVENTS];
