import { QUERY_KEYS } from '@/shared/api'

export const sessionKeys = {
  user: [QUERY_KEYS.AUTH, QUERY_KEYS.USER] as const,
}
