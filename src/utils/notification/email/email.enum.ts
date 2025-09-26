export enum EmailType {
  // User-related emails
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_APPROVED = 'account_approved',
  ACCOUNT_REJECTED = 'account_rejected',
  INITIAL_CREDENTIALS = 'initial_credentials',

  // Event-related emails
  EVENT_CREATED = 'event_created',
  EVENT_APPROVED = 'event_approved',
  EVENT_REJECTED = 'event_rejected',
  EVENT_REMINDER = 'event_reminder',
  EVENT_UPDATED = 'event_updated',
  EVENT_CANCELLED = 'event_cancelled',
  POST_EVENT_REMINDER = 'post_event_reminder',

  // Sponsor-related emails
  SPONSOR_APPLICATION = 'sponsor_application',
  SPONSOR_APPROVED = 'sponsor_approved',
  SPONSOR_REJECTED = 'sponsor_rejected',

  // Speaker-related emails
  SPEAKER_INVITATION = 'speaker_invitation',
  SPEAKER_ACCEPTED = 'speaker_accepted',
  SPEAKER_REJECTED = 'speaker_rejected',

  // System notifications
  SYSTEM_MAINTENANCE = 'system_maintenance',
  NEWSLETTER = 'newsletter',
  CONTACT_FORM = 'contact_form',
}
