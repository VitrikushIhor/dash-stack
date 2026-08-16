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
  task: '/task',
  calendar: '/calendar',
  settings: '/settings',
  settingsAppearance: '/settings/appearance',
  settingsNotifications: '/settings/notifications',
  settingsDisplay: '/settings/display',
  acceptInvite: '/accept-invite',

  // Legal
  terms: '/terms',
  privacy: '/privacy',
} as const
