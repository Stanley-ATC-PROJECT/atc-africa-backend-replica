import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationService } from 'src/utils/notification/notification.service';
import { EmailType } from 'src/utils/notification/email/email.enum';
import {
  POST_EVENT_REMINDER_INITIAL_DELAY_DAYS,
  POST_EVENT_REMINDER_FOLLOW_UP_INTERVAL_MS,
  POST_EVENT_REMINDER_MAX_FOLLOW_UP_DAYS,
} from 'src/utils/config/constants.config';

export interface ScheduledEventReminder {
  eventId: string;
  attempt: number;
  scheduledFor: Date;
  jobName: string;
}

/**
 * EventNotificationService - Handles event-specific notification scheduling
 *
 * This service manages post-event reminders and other event-related notifications.
 * It's decoupled from the general notification system and focuses specifically
 * on event lifecycle notifications.
 */
@Injectable()
export class EventNotificationService {
  private readonly logger = new Logger(EventNotificationService.name);
  private readonly activeReminders = new Map<string, ScheduledEventReminder>();

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Start the post-event reminder process for an event
   */
  async startPostEventReminderProcess(event: {
    id: string;
    event_date: Date;
  }): Promise<void> {
    const baseTime = new Date(event.event_date);
    const scheduledFor = new Date(
      baseTime.getTime() +
        POST_EVENT_REMINDER_INITIAL_DELAY_DAYS * 24 * 60 * 60 * 1000,
    );

    // Only schedule if the scheduled time is in the future
    if (scheduledFor.getTime() > Date.now()) {
      this.schedulePostEventReminder(event.id, 1, scheduledFor);
      this.logger.log(
        `Started post-event reminder process for event ${event.id} at ${scheduledFor.toISOString()}`,
      );
    } else {
      this.logger.warn(
        `Cannot schedule past-due reminder for event ${event.id}. Event date: ${event.event_date}`,
      );
    }
  }

  /**
   * Schedule a post-event reminder to run at a specific date/time
   */
  private schedulePostEventReminder(
    eventId: string,
    attempt: number,
    scheduledFor: Date,
  ): void {
    const jobName = `post-event-reminder-${eventId}-${attempt}`;

    // Remove existing job if it exists
    this.cancelPostEventReminder(eventId, attempt);

    // Create a timeout-based job for the scheduled time
    const delayMs = scheduledFor.getTime() - Date.now();

    if (delayMs > 0) {
      const timeoutId = setTimeout(() => {
        this.executePostEventReminder(eventId, attempt);
      }, delayMs);

      // Track the active reminder with timeout ID
      this.activeReminders.set(`${eventId}-${attempt}`, {
        eventId,
        attempt,
        scheduledFor,
        jobName: timeoutId.toString(),
      });
    } else {
      // If the scheduled time has passed, execute immediately
      this.executePostEventReminder(eventId, attempt);
    }

    this.logger.log(
      `Scheduled post-event reminder for event ${eventId} (attempt ${attempt}) at ${scheduledFor.toISOString()}`,
    );
  }

  /**
   * Schedule follow-up reminder after a delay
   */
  private scheduleFollowUpReminder(
    eventId: string,
    attempt: number,
    delayMs: number,
  ): void {
    const scheduledFor = new Date(Date.now() + delayMs);
    this.schedulePostEventReminder(eventId, attempt, scheduledFor);
  }

  /**
   * Cancel a specific post-event reminder
   */
  cancelPostEventReminder(eventId: string, attempt: number): void {
    const reminderKey = `${eventId}-${attempt}`;
    const reminder = this.activeReminders.get(reminderKey);

    if (reminder) {
      try {
        // Clear the timeout using the stored timeout ID
        clearTimeout(parseInt(reminder.jobName));
        this.activeReminders.delete(reminderKey);
        this.logger.log(
          `Cancelled post-event reminder for event ${eventId} (attempt ${attempt})`,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to cancel reminder ${reminder.jobName}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Cancel all reminders for a specific event
   */
  cancelAllEventReminders(eventId: string): void {
    const remindersToCancel = Array.from(this.activeReminders.values()).filter(
      (reminder) => reminder.eventId === eventId,
    );

    remindersToCancel.forEach((reminder) => {
      this.cancelPostEventReminder(reminder.eventId, reminder.attempt);
    });

    this.logger.log(`Cancelled all reminders for event ${eventId}`);
  }

  /**
   * Get all active reminders for monitoring
   */
  getActiveReminders(): ScheduledEventReminder[] {
    return Array.from(this.activeReminders.values());
  }

  /**
   * Execute the post-event reminder logic
   */
  private async executePostEventReminder(
    eventId: string,
    attempt: number,
  ): Promise<void> {
    const reminderKey = `${eventId}-${attempt}`;

    try {
      this.logger.log(
        `Executing post-event reminder for event ${eventId} (attempt ${attempt})`,
      );

      // Remove from active reminders since it's being executed
      this.activeReminders.delete(reminderKey);

      // Fetch event with highlight and organizer
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: {
          event_highlight: true,
          organizer: true,
        },
      });

      if (!event) {
        this.logger.warn(
          `Event ${eventId} not found. Skipping post-event reminder.`,
        );
        return;
      }

      // If highlight exists, no reminder needed
      if (event.event_highlight) {
        this.logger.log(
          `Event ${eventId} already has highlight. Skipping reminder and cancelling future reminders.`,
        );
        this.cancelAllEventReminders(eventId);
        return;
      }

      // If no highlight, send reminder email
      if (event.organizer?.email) {
        try {
          await this.notificationService.sendEmailNotification({
            to: event.organizer.email,
            type: EmailType.POST_EVENT_REMINDER,
            context: {
              eventTitle: event.title,
              eventDate: event.event_date,
              attempt,
              maxAttempts: POST_EVENT_REMINDER_MAX_FOLLOW_UP_DAYS,
            },
          });

          this.logger.log(
            `Post-event reminder email sent for event ${eventId} (attempt ${attempt}).`,
          );
        } catch (err) {
          this.logger.error(
            `Failed to send reminder email for event ${eventId}: ${err.message}`,
          );
        }
      } else {
        this.logger.warn(
          `Organizer email not found for event ${eventId}, cannot send reminder.`,
        );
      }

      // Schedule next follow-up if attempt < max
      if (attempt < POST_EVENT_REMINDER_MAX_FOLLOW_UP_DAYS) {
        const nextAttempt = attempt + 1;
        const delay = POST_EVENT_REMINDER_FOLLOW_UP_INTERVAL_MS; // 24h

        this.scheduleFollowUpReminder(eventId, nextAttempt, delay);

        this.logger.log(
          `Scheduled follow-up post-event reminder for event ${eventId} (attempt ${nextAttempt}).`,
        );
      } else {
        this.logger.log(
          `Max follow-up attempts reached for event ${eventId}. No further reminders will be scheduled.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error executing post-event reminder for event ${eventId} (attempt ${attempt}): ${error.message}`,
        error.stack,
      );

      // Remove from active reminders on error
      this.activeReminders.delete(reminderKey);
    }
  }

  /**
   * Send event approval notification
   */
  async sendEventApprovalNotification(eventId: string): Promise<void> {
    try {
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: { organizer: true },
      });

      if (!event || !event.organizer?.email) {
        this.logger.warn(`Event ${eventId} or organizer email not found`);
        return;
      }

      await this.notificationService.sendEmailNotification({
        to: event.organizer.notificationEmail,
        type: EmailType.EVENT_APPROVED,
        context: {
          eventTitle: event.title,
          eventDate: event.event_date,
        },
      });

      this.logger.log(`Event approval notification sent for event ${eventId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send event approval notification for event ${eventId}: ${error.message}`,
      );
    }
  }

  /**
   * Send event rejection notification
   */
  async sendEventRejectionNotification(
    eventId: string,
    reason?: string,
  ): Promise<void> {
    try {
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: { organizer: true },
      });

      if (!event || !event.organizer?.email) {
        this.logger.warn(`Event ${eventId} or organizer email not found`);
        return;
      }

      await this.notificationService.sendEmailNotification({
        to: event.organizer.notificationEmail,
        type: EmailType.EVENT_REJECTED,
        context: {
          eventTitle: event.title,
          eventDate: event.event_date,
          reason: reason || 'No reason provided',
        },
      });

      this.logger.log(`Event rejection notification sent for event ${eventId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send event rejection notification for event ${eventId}: ${error.message}`,
      );
    }
  }
}
