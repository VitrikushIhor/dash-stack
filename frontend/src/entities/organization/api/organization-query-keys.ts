import { QUERY_KEYS } from '@/shared/api'

export const organizationKeys = {
  all: [QUERY_KEYS.ORGANIZATIONS] as const,
  lists: () => [...organizationKeys.all, 'lists'] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (slug: string) => [...organizationKeys.details(), slug] as const,
  members: (slug: string) =>
    [...organizationKeys.detail(slug), 'members'] as const,
  member: (slug: string, userId: string) =>
    [...organizationKeys.members(slug), userId] as const,
}
