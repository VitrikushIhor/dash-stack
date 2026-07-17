import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '@/shared/api'
import { userApi } from '../user-api'
import { userKeys } from '../user-query-keys'

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: userApi.getMe,
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}
