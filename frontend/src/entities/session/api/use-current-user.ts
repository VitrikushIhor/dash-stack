import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '@/shared/api'
import { sessionApi } from './session-api'
import { sessionKeys } from './session-query-keys'

export function useCurrentUser() {
  return useQuery({
    queryKey: sessionKeys.user,
    queryFn: sessionApi.getMe,
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}
