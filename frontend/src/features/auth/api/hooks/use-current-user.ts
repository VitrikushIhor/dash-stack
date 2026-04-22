import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '../../../../shared/api/api-helpers'
import { authApi } from '../auth-api'
import { authKeys } from '../auth-query-keys'

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: authApi.getMe,
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}
