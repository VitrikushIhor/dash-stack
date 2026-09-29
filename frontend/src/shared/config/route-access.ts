import { ROUTES } from './constants/routes'

const PROTECTED_PATHS = [
  ROUTES.settings,
  ROUTES.vocabSettings,
  ROUTES.organizations,
  ROUTES.acceptInvite,
  ROUTES.createOrganization,
  ROUTES.vocabDeckNew,
]

const AUTH_PATHS = [
  ROUTES.signIn,
  ROUTES.signUp,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
]

const CREDENTIAL_PATHS = new Set<string>([
  ROUTES.acceptInvite,
  ROUTES.signIn,
  ROUTES.resetPassword,
  ROUTES.verifyEmail,
])

export function isCredentialPath(pathname: string): boolean {
  return CREDENTIAL_PATHS.has(pathname)
}

export function isProtectedPath(pathname: string): boolean {
  return (
    PROTECTED_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    ) || /^\/vocab\/decks\/[^/]+\/edit(?:\/|$)/.test(pathname)
  )
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

export const SESSION_UNAVAILABLE_PATH = '/session-unavailable'
