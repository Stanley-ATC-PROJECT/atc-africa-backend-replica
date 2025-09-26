# Notification System Architecture

## Overview

The notification system has been refactored to use **NestJS Event Emitter** and **NestJS Schedule** instead of BullMQ and Redis. This provides a cleaner, more maintainable architecture that doesn't require external dependencies for basic scheduling.

## Key Components

### 1. Event-Driven Architecture

- **EmailListener**: Handles immediate email sending
- **Event Classes**: Type-safe event definitions in `events/notification.events.ts`
- **Event Emitter**: Built-in NestJS event system for decoupled communication

### 2. Scheduling System

- **NotificationSchedulerService**: Manages dynamic cron jobs for post-event reminders
- **NestJS Schedule Module**: Built-in task scheduling using cron expressions
- **Dynamic Job Management**: Create, cancel, and track scheduled reminders

### 3. Services

- **NotificationService**: Main facade for notification operations
- **NotificationSchedulerService**: Handles all scheduling logic
- **EmailService**: Unchanged - handles actual email sending

## Usage Examples

### Sending Immediate Email

```typescript
await notificationService.sendEmailNotification({
  to: 'user@example.com',
  type: EmailType.WELCOME,
  context: { userName: 'John' },
});
```

### Scheduling Post-Event Reminders

```typescript
await notificationService.startPostEventReminderProcess({
  id: 'event-123',
  event_date: new Date('2024-01-15'),
});
```

### Managing Scheduled Reminders

```typescript
// Cancel all reminders for an event
await notificationService.cancelEventReminders('event-123');

// View active reminders
const activeReminders = notificationService.getActiveReminders();
```

## Benefits Over BullMQ

1. **No Redis Dependency**: Eliminates Redis connection issues
2. **Built-in Scheduling**: Uses NestJS's native scheduling capabilities
3. **Better Resource Management**: No blocking setTimeout calls
4. **Type Safety**: Strongly typed events and scheduling
5. **Simpler Architecture**: Fewer moving parts and dependencies
6. **Better Error Handling**: Integrated with NestJS's error handling

## Migration Notes

- **BullMQ Processors Removed**: Replaced with event listeners and scheduler service
- **Queue Jobs → Events**: Job data now flows through typed events
- **setTimeout → Cron Jobs**: Delays are now proper scheduled tasks
- **Better Monitoring**: Active reminders can be queried and managed

## Monitoring

The scheduler service provides methods to:

- View all active reminders: `getActiveReminders()`
- Cancel specific reminders: `cancelPostEventReminder(eventId, attempt)`
- Cancel all event reminders: `cancelAllEventReminders(eventId)`

## File Structure

```
src/utils/notification/
├── events/
│   └── notification.events.ts      # Event definitions
├── listeners/
│   ├── email.listener.ts          # Email event handler
│   └── post-event-reminder.listener.ts  # Simplified (optional)
├── services/
│   └── notification-scheduler.service.ts  # Scheduling logic
├── notification.service.ts        # Main service facade
├── notification.module.ts         # Module configuration
└── index.ts                       # Exports
```

This architecture is more maintainable, performant, and aligned with NestJS best practices.
