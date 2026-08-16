export const COOKIE_CONFIG = {
  ACCESS_TOKEN: {
    name: 'access_token',
    maxAge: 60 * 15, // 15 minutes
  },
  REFRESH_TOKEN: {
    name: 'refresh_token',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  ACTIVE_ORG_ID: {
    name: 'active_org_id',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
  DIRECTION: {
    name: 'dir',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
  SIDEBAR_STATE: {
    name: 'sidebar_state',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  LAYOUT_COLLAPSIBLE: {
    name: 'layout_collapsible',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  LAYOUT_VARIANT: {
    name: 'layout_variant',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
} as const
