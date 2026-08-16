import { format, isValid, parseISO } from 'date-fns'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ROUTES } from '@/shared/config'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 65%, 50%)`
}

export function getUserInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null
) {
  if (firstName && lastName)
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName.slice(0, 2).toUpperCase()
  if (email) return email.slice(0, 2).toUpperCase()
  return 'U'
}

export function getUserDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null
) {
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName
  if (email) return email
  return 'User'
}

export function sanitizeRedirectUrl(
  url: string | undefined | null,
  fallback: string = ROUTES.organizations
): string {
  if (!url || typeof url !== 'string') return fallback
  const trimmed = url.trim()
  if (
    trimmed.startsWith('/') &&
    !trimmed.startsWith('//') &&
    !trimmed.startsWith('/\\')
  ) {
    return trimmed
  }
  return fallback
}

/**
 * Formats an ISO date string or Date instance using date-fns.
 * Returns null if the date is invalid, null, or undefined.
 */
export function formatDate(
  dateValue?: string | Date | null,
  formatStr: string = 'MMM d, yyyy'
): string | null {
  if (!dateValue) return null
  const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue
  if (!isValid(date)) return null
  return format(date, formatStr)
}
