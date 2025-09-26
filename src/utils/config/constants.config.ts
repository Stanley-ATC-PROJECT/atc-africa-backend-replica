import { CookieOptions } from 'express';

export const DRIZZLE_SYMBOL = Symbol('Drizzle');
export const JWT_SYMBOL = Symbol('JWT');

// Response status
export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
}

// Global cookie options
export const GLOBAL_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// Name of server side cookie
export const SERVER_COOKIE_NAME = 'access_token';

// Post-event reminder configuration
export const POST_EVENT_REMINDER_INITIAL_DELAY_DAYS = 2; // days after event date to send first reminder
export const POST_EVENT_REMINDER_MAX_FOLLOW_UP_DAYS = 7; // maximum number of daily follow-ups after first reminder
export const POST_EVENT_REMINDER_FOLLOW_UP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
