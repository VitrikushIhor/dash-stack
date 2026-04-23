import { QUERY_KEYS } from '@/shared/api/query-keys'

export const invitationKeys = {
  all: [QUERY_KEYS.INVITATIONS] as const,
  orgList: (orgId: string) => [...invitationKeys.all, 'org', orgId] as const,
}
