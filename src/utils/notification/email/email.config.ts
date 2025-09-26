import { EmailType } from './email.enum';
import { config } from 'dotenv';
config();

// Base configuration for all email templates
export const EmailBaseConfig = {
  companyName: process.env.COMPANY_NAME || 'ATC Africa',
  companyEmail: process.env.COMPANY_EMAIL || 'support@atcafrica.com',
  supportEmail: process.env.COMPANY_EMAIL || 'support@atcafrica.com',
  websiteUrl: process.env.FRONTEND_URL || 'https://atcafrica.com',
  currentYear: new Date().getFullYear(),
};

// Map all EmailPaths to their corresponding EJS template filenames
export const EmailTemplates: Record<EmailType, string> = {
  // User-related emails
  [EmailType.WELCOME]: 'welcome.ejs',
  [EmailType.EMAIL_VERIFICATION]: 'email-verification.ejs',
  [EmailType.PASSWORD_RESET]: 'password-reset.ejs',
  [EmailType.ACCOUNT_APPROVED]: 'account-approved.ejs',
  [EmailType.ACCOUNT_REJECTED]: 'account-rejected.ejs',
  [EmailType.INITIAL_CREDENTIALS]: 'initial-credentials.ejs',
  // Event-related emails
  [EmailType.EVENT_CREATED]: 'event-created.ejs',
  [EmailType.EVENT_APPROVED]: 'event-approved.ejs',
  [EmailType.EVENT_REJECTED]: 'event-rejected.ejs',
  [EmailType.EVENT_REMINDER]: 'event-reminder.ejs',
  [EmailType.EVENT_UPDATED]: 'event-updated.ejs',
  [EmailType.EVENT_CANCELLED]: 'event-cancelled.ejs',

  // Sponsor-related emails
  [EmailType.SPONSOR_APPLICATION]: 'sponsor-application.ejs',
  [EmailType.SPONSOR_APPROVED]: 'sponsor-approved.ejs',
  [EmailType.SPONSOR_REJECTED]: 'sponsor-rejected.ejs',

  // Speaker-related emails
  [EmailType.SPEAKER_INVITATION]: 'speaker-invitation.ejs',
  [EmailType.SPEAKER_ACCEPTED]: 'speaker-accepted.ejs',
  [EmailType.SPEAKER_REJECTED]: 'speaker-rejected.ejs',

  // System notifications
  [EmailType.SYSTEM_MAINTENANCE]: 'system-maintenance.ejs',
  [EmailType.NEWSLETTER]: 'newsletter.ejs',
  [EmailType.CONTACT_FORM]: 'contact-form.ejs',
  [EmailType.POST_EVENT_REMINDER]: 'post-event-reminder.ejs',
} as const;

export const EmailSubjects: Record<EmailType, string> = {
  // User-related emails
  [EmailType.WELCOME]:
    'Welcome to ATC Africa - Your Tech Community Journey Begins!',
  [EmailType.EMAIL_VERIFICATION]: 'Verify Your Email - ATC Africa',
  [EmailType.PASSWORD_RESET]: 'Reset Your Password - ATC Africa',
  [EmailType.ACCOUNT_APPROVED]: 'Account Approved - Welcome to ATC Africa!',
  [EmailType.ACCOUNT_REJECTED]: 'Account Application Update - ATC Africa',
  [EmailType.INITIAL_CREDENTIALS]: 'Initial Credentials - ATC Africa',
  // Event-related emails
  [EmailType.EVENT_CREATED]: 'Event Created Successfully - ATC Africa',
  [EmailType.EVENT_APPROVED]: 'Event Approved - Your Event is Live!',
  [EmailType.EVENT_REJECTED]: 'Event Application Update - ATC Africa',
  [EmailType.EVENT_REMINDER]: "Event Reminder - Don't Miss Out!",
  [EmailType.EVENT_UPDATED]: 'Event Updated - Important Changes',
  [EmailType.EVENT_CANCELLED]: 'Event Cancelled - Important Notice',

  // Sponsor-related emails
  [EmailType.SPONSOR_APPLICATION]: 'Sponsor Application Received - ATC Africa',
  [EmailType.SPONSOR_APPROVED]: 'Sponsor Application Approved - Welcome!',
  [EmailType.SPONSOR_REJECTED]: 'Sponsor Application Update - ATC Africa',

  // Speaker-related emails
  [EmailType.SPEAKER_INVITATION]: 'Speaker Invitation - Join Our Event!',
  [EmailType.SPEAKER_ACCEPTED]:
    'Speaker Application Accepted - Congratulations!',
  [EmailType.SPEAKER_REJECTED]: 'Speaker Application Update - ATC Africa',

  // System notifications
  [EmailType.SYSTEM_MAINTENANCE]: 'Scheduled Maintenance Notice - ATC Africa',
  [EmailType.NEWSLETTER]: 'ATC Africa Newsletter - Latest Updates',
  [EmailType.CONTACT_FORM]: 'Contact Form Submission - ATC Africa',

  [EmailType.POST_EVENT_REMINDER]:
    'We Value Your Feedback - Post Event Reminder',
} as const;
