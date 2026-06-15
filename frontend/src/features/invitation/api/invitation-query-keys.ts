import { QUERY_KEYS } from '@/shared/api'

export const invitationKeys = {
  all: [QUERY_KEYS.INVITATIONS] as const,
  orgList: (orgId: string) => [...invitationKeys.all, 'org', orgId] as const,
}
