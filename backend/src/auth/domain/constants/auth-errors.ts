export const AUTH_ERRORS = {
  OAUTH_ACCOUNT_ALREADY_LINKED: 'This provider account is already connected to another user',
  OAUTH_PROVIDER_ALREADY_LINKED: 'A different account for this provider is already connected',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
  SOCIAL_LOGIN_ONLY: 'This account uses social login. Please sign in with Google or GitHub.',

  INVALID_VERIFICATION_TOKEN: 'Invalid verification token',
  INVALID_TOKEN_TYPE: 'Invalid token type',
  VERIFICATION_TOKEN_EXPIRED: 'Verification token has expired',

  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  INVALID_REFRESH_TOKEN_BODY: 'Invalid refresh token body',
  INVALID_ACCESS_TOKEN: 'Invalid access token',
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',

  INVALID_RESET_TOKEN: 'Invalid reset token',
  RESET_TOKEN_EXPIRED: 'Reset token has expired',

  FORGOT_PASSWORD_SUCCESS: 'If an account exists, a password reset email has been sent.',
  SIGNUP_SUCCESS: 'If this address needs verification, check your inbox.',
  LOGOUT_SUCCESS: 'Logged out successfully',
  LOGOUT_ALL_SUCCESS: 'Logged out from all devices',
  RESET_PASSWORD_SUCCESS: 'Password reset successfully. Please log in with your new password.',

  AUTH0_DOMAIN_NOT_CONFIGURED: 'Auth0 domain is not configured',
  INVALID_AUTH0_TOKEN: 'Invalid Auth0 token',
  AUTH0_NO_EMAIL: 'Auth0 token does not contain email information',
  AUTH0_EMAIL_NOT_VERIFIED: 'OAuth email is not verified',
  AUTH0_LINKING_NOT_ALLOWED: 'Automatic OAuth account linking is not allowed',
  INVALID_AUTH0_IDENTITY: 'Invalid Auth0 identity',
  AUTH0_INVALID_RESPONSE: 'Auth0 returned an invalid response',
  AUTH0_UNAVAILABLE: 'Auth0 is temporarily unavailable',
  AUTH0_NOT_CONFIGURED: 'Auth0 code exchange is not configured',
} as const;
