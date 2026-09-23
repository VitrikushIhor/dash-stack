import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/shared/api'
import { userApi } from '../user-api'
import { userKeys } from '../user-query-keys'

async function getCurrentUserOrGuest() {
  try {
    return await userApi.getMe()
  } catch (error: unknown) {
    // TODO(auth-refactor): remove this local 401 adapter when the auth layer
    // exposes an explicit resolved guest state instead of rejecting /me.
    if (error instanceof ApiError && error.isUnauthorized) return null

    throw error
  }
}

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getCurrentUserOrGuest,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}
