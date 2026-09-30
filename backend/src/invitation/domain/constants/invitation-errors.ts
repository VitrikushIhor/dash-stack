export const INVITATION_ERRORS = {
  ALREADY_MEMBER: 'User is already a member of this organization',
  ALREADY_SENT: 'Invitation already sent to this email',
  NOT_FOUND: 'Invitation not found',
  EMAIL_MISMATCH: 'This invitation was sent to a different email address',
  ALREADY_ACCEPTED: 'Invitation already accepted',
  EXPIRED: 'Invitation expired',
  NOT_IN_ORG: 'Invitation not found in this organization',
  ORG_NOT_FOUND: 'Organization not found',
  OWNER_ROLE_FORBIDDEN: 'Organization ownership cannot be granted by invitation',
  NO_LONGER_VALID: 'Invitation is no longer valid',
} as const;
