import { QUERY_KEYS } from '@/shared/api'

export const organizationKeys = {
  all: [QUERY_KEYS.ORGANIZATIONS] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  members: (orgId: string) =>
    [...organizationKeys.detail(orgId), 'members'] as const,
  member: (orgId: string, userId: string) =>
    [...organizationKeys.members(orgId), userId] as const,
}
