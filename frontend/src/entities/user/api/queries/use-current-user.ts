import { useQuery } from '@tanstack/react-query'
import { ApiError, getErrorMessage } from '@/shared/api'
import { AUTH_STATE_STATUS } from '../../model/auth-state-status'
import type { AuthState } from '../../model/auth-state.types'
import { type User } from '../../model/types'
import { userApi } from '../user-api'
import { userKeys } from '../user-query-keys'

async function getCurrentUserOrGuest(): Promise<User | null> {
  try {
    return await userApi.getMe()
  } catch (error: unknown) {
    if (error instanceof ApiError && error.isUnauthorized) return null

    throw error
  }
}

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getCurrentUserOrGuest,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) =>
      failureCount < 1 &&
      (error instanceof TypeError ||
        (error instanceof DOMException && error.name === 'TimeoutError') ||
        (error instanceof ApiError && error.statusCode >= 500)),
  })
}

export function useCurrentUserState() {
  const { data, error, isError, isPending, refetch } = useCurrentUser()
  let authState: AuthState

  if (isPending) {
    authState = { status: AUTH_STATE_STATUS.LOADING }
  } else if (data === null) {
    authState = { status: AUTH_STATE_STATUS.GUEST }
  } else if (data !== undefined) {
    authState = { status: AUTH_STATE_STATUS.AUTHENTICATED, user: data }
  } else {
    authState = {
      status: AUTH_STATE_STATUS.ERROR,
      message: getErrorMessage(isError ? error : undefined),
    }
  }

  return { authState, refetch }
}
