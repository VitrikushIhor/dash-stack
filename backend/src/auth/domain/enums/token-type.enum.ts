export const AuthTokenType = {
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
} as const;

export type AuthTokenType = (typeof AuthTokenType)[keyof typeof AuthTokenType];
