export const AUTH_ERRORS = {
  USER_ALREADY_EXISTS: 'User with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  SOCIAL_LOGIN_ONLY:
    'This account uses social login. Please sign in with Google or GitHub.',

  INVALID_VERIFICATION_TOKEN: 'Invalid verification token',
  INVALID_TOKEN_TYPE: 'Invalid token type',
  VERIFICATION_TOKEN_EXPIRED: 'Verification token has expired',

  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',

  INVALID_RESET_TOKEN: 'Invalid reset token',
  RESET_TOKEN_EXPIRED: 'Reset token has expired',

  FORGOT_PASSWORD_SUCCESS:
    'If an account exists, a password reset email has been sent.',
  SIGNUP_SUCCESS: 'Verification email sent. Please check your inbox.',
  LOGOUT_SUCCESS: 'Logged out successfully',
  LOGOUT_ALL_SUCCESS: 'Logged out from all devices',
  RESET_PASSWORD_SUCCESS:
    'Password reset successfully. Please log in with your new password.',

  AUTH0_DOMAIN_NOT_CONFIGURED: 'Auth0 domain is not configured',
  INVALID_AUTH0_TOKEN: 'Invalid Auth0 token',
  AUTH0_NO_EMAIL: 'Auth0 token does not contain email information',
} as const;
