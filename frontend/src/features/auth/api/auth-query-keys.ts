import { QUERY_KEYS } from '@/shared/api/query-keys'

export const authKeys = {
  all: [QUERY_KEYS.AUTH] as const,
  user: [QUERY_KEYS.AUTH, QUERY_KEYS.USER] as const,
}
