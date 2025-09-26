export { NotificationModule } from './notification.module';
export { NotificationService } from './notification.service';
export { EmailListener } from './listeners/email.listener';
// Event classes and types
export {
  EmailNotificationEvent,
  NOTIFICATION_EVENTS,
} from './events/notification.events';
export type {
  EmailNotificationPayload,
  NotificationOptions,
} from './notification.service';
