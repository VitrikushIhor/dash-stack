/**
 * TODO: i18n Integration
 * When implementing i18n (e.g., using next-intl), this file and the cookie-based
 * direction storage logic will become obsolete.
 * The direction (dir) should be determined exclusively by the current locale
 * (e.g., from the URL /[locale]/...), rather than persisted user state.
 */
import { COOKIE_CONFIG } from '@/shared/lib/cookie-config'

export const directions = ['ltr', 'rtl'] as const

export type Direction = (typeof directions)[number]

export const DEFAULT_DIRECTION: Direction = 'ltr'

export const DIRECTION_COOKIE_NAME = COOKIE_CONFIG.DIRECTION.name
export const DIRECTION_COOKIE_MAX_AGE = COOKIE_CONFIG.DIRECTION.maxAge

export function isDirection(value: unknown): value is Direction {
  return (
    typeof value === 'string' &&
    (directions as readonly string[]).includes(value)
  )
}
