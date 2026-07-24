export const MS_IN_SECOND = 1000;
export const MS_IN_MINUTE = 60 * MS_IN_SECOND;
export const MS_IN_HOUR = 60 * MS_IN_MINUTE;
export const MS_IN_DAY = 24 * MS_IN_HOUR;

export const EMAIL_VERIFICATION_TOKEN_TTL = MS_IN_DAY; // 24 hours
export const PASSWORD_RESET_TOKEN_TTL = MS_IN_HOUR; // 1 hour
export const DEFAULT_REFRESH_TOKEN_TTL = 7 * MS_IN_DAY; // 7 days
export const UNKNOWN_PROVIDER = 'unknown';

export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const AUTH_COOKIE_TTL = {
  ACCESS_TOKEN: 15 * MS_IN_MINUTE, // 15 minutes
  REFRESH_TOKEN: 30 * MS_IN_DAY, // 30 days
} as const;
