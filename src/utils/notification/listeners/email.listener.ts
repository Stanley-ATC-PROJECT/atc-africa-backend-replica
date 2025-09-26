import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../email/email.service';
import {
  EmailNotificationEvent,
  NOTIFICATION_EVENTS,
} from '../events/notification.events';

@Injectable()
export class EmailListener {
  private readonly logger = new Logger(EmailListener.name);

  constructor(private readonly emailService: EmailService) {}

  @OnEvent(NOTIFICATION_EVENTS.EMAIL_SEND)
  async handleEmailNotification(event: EmailNotificationEvent): Promise<void> {
    this.logger.log(
      `Processing email notification: ${event.type} to ${event.to}`,
    );

    try {
      // Send the email using the existing email service
      const success = await this.emailService.sendMail({
        to: event.to,
        type: event.type,
        context: event.context,
      });

      if (!success) {
        throw new Error('Email service returned false');
      }

      this.logger.log(`Email sent successfully: ${event.type} to ${event.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email: ${event.type} to ${event.to}`,
        error.stack,
      );

      // Note: For retry logic, consider using the scheduler service to schedule retry attempts
      if (event.options?.attempts && event.options.attempts > 1) {
        this.logger.log(
          `Email failed with retry attempts specified. Consider implementing retry logic with the scheduler service.`,
        );
      }

      throw error;
    }
  }
}
