import { OrgRole } from '../types/org-role'

/**
 * Formats a team position string (e.g., "LEAD_DEVELOPER" -> "Lead Developer")
 */
export const formatPosition = (pos?: string) => {
  if (!pos) return '—'
  return pos
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Returns the appropriate UI variant for a given organizational role
 */
export const getRoleVariant = (
  role?: OrgRole | string
): 'default' | 'secondary' | 'outline' => {
  const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role

  switch (normalizedRole) {
    case OrgRole.OWNER:
    case 'OWNER':
      return 'default'
    case OrgRole.ADMIN:
    case 'ADMIN':
      return 'secondary'
    case OrgRole.MEMBER:
    case 'MEMBER':
    case OrgRole.GUEST:
    case 'GUEST':
    default:
      return 'outline'
  }
}

/**
 * Formats a date string or object into a human-readable "Member since" format
 */
export const formatJoinedDate = (date?: string | Date) => {
  if (!date) return 'Unknown date'
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Unknown date'

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Unknown date'
  }
}

/**
 * Returns the display name for a member, falling back to email or 'User'
 */
export const getMemberDisplayName = (user?: {
  firstName?: string
  email?: string
}) => {
  return user?.firstName || user?.email || 'User'
}
