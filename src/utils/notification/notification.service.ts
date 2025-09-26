import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EmailNotificationEvent,
  NOTIFICATION_EVENTS,
} from './events/notification.events';
import { EmailType } from './email/email.enum';

export interface EmailNotificationPayload {
  to: string;
  type: EmailType;
  context: Record<string, any>;
}

export interface NotificationOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
}

/**
 * NotificationService - Focused solely on email notification delivery
 *
 * This service provides a clean interface for sending emails through the event system.
 * It's designed to be extensible and used by other modules (like events, users, etc.)
 * without coupling them to specific email implementation details.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Sends an email notification by emitting an event
   * @param payload - Email notification payload
   * @param options - Optional configuration
   */
  async sendEmailNotification(
    payload: EmailNotificationPayload,
    options: NotificationOptions = {},
  ): Promise<void> {
    try {
      const emailEvent = new EmailNotificationEvent(
        payload.to,
        payload.type,
        payload.context,
        {
          priority: options.priority || 0,
          delay: options.delay || 0,
          attempts: options.attempts || 3,
        },
      );

      this.eventEmitter.emit(NOTIFICATION_EVENTS.EMAIL_SEND, emailEvent);

      this.logger.log(
        `Email notification event emitted: ${payload.type} to ${payload.to}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to emit email notification event: ${payload.type} to ${payload.to}`,
        error.stack,
      );
      throw error;
    }
  }
}
