import { QUERY_KEYS } from '@/shared/api/query-keys'

export const organizationKeys = {
  all: [QUERY_KEYS.ORGANIZATIONS] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
}
