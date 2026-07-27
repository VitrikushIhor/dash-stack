export const ROUTES = {
  home: '/',

  // Auth
  signIn: '/sign-in',
  signUp: '/sign-up',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',

  // App
  organizations: '/organizations',
  createOrganization: '/create-organization',
  dashboard: '/dashboard',
  calendar: '/calendar',
  settings: '/settings',

  // Legal
  terms: '/terms',
  privacy: '/privacy',
} as const
