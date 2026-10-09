export const ROUTES = {
  home: '/',

  // Auth
  signIn: '/sign-in',
  oauthStart: '/api/auth/oauth/start',
  signUp: '/sign-up',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',

  // App
  organizations: '/organizations',
  createOrganization: '/create-organization',
  settings: '/user/settings',
  settingsSessions: '/user/settings/sessions',
  settingsAccounts: '/user/settings/accounts',
  settingsAppearance: '/user/settings/appearance',
  settingsNotifications: '/user/settings/notifications',
  settingsDisplay: '/user/settings/display',
  acceptInvite: '/accept-invite',

  // Tenant Routes (Slug-based)
  orgOverview: (slug: string) => `/organizations/${slug}`,
  orgTasks: (slug: string) => `/organizations/${slug}/tasks`,
  orgTasksList: (slug: string) => `/organizations/${slug}/tasks/list`,
  orgTasksTable: (slug: string) => `/organizations/${slug}/tasks/table`,
  orgCalendar: (slug: string) => `/organizations/${slug}/calendar`,
  orgCalendarView: (slug: string, view: 'day' | 'week' | 'month') =>
    `/organizations/${slug}/calendar/${view}`,
  orgMembers: (slug: string) => `/organizations/${slug}/members`,
  orgMemberDetail: (slug: string, userId: string) =>
    `/organizations/${slug}/members/${userId}`,
  orgLabels: (slug: string) => `/organizations/${slug}/labels`,
  orgSettings: (slug: string) => `/organizations/${slug}/settings`,

  // Vocabulary / SRS
  vocabDecks: '/vocab/decks',
  vocabDeckNew: '/vocab/decks/new',
  vocabDeck: (id: string) => `/vocab/decks/${id}`,
  vocabDeckEdit: (id: string) => `/vocab/decks/${id}/edit`,
  vocabCatalog: '/vocab/catalog',
  vocabSettings: '/user/settings',
  vocabSettingsSessions: '/user/settings/sessions',
  vocabSettingsAccounts: '/user/settings/accounts',
  vocabDeckStudy: (id: string) => `/vocab/decks/${id}/flashcards`,
  vocabDeckLearn: (id: string) => `/vocab/decks/${id}/learn`,
  vocabMatch: (id: string) => `/vocab/decks/${id}/match`,

  // Legal
  terms: '/terms',
  privacy: '/privacy',
} as const
