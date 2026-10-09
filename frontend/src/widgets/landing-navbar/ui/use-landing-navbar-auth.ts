'use client'

import { getUserDisplayName, getUserInitials } from '@/shared/lib/utils'
import { useCurrentUserState } from '@/entities/user'
import { useLogout } from '@/features/auth'

interface NavbarAuthViewModel {
  isAuthenticated: boolean
  isLoading: boolean
  authError: string | null
  retryAuth: () => void
  displayName: string
  initials: string
  email: string | undefined
  avatar: string | null | undefined
  isPendingLogout: boolean
  logout: () => void
}

export function useLandingNavbarAuth(): NavbarAuthViewModel {
  const { authState, refetch } = useCurrentUserState()
  const { handleLogout, isPending } = useLogout()
  const user = authState.status === 'authenticated' ? authState.user : null
  const isLoading = authState.status === 'loading'

  return {
    isAuthenticated: authState.status === 'authenticated',
    isLoading,
    authError: authState.status === 'error' ? authState.message : null,
    retryAuth: () => void refetch(),

    displayName: getUserDisplayName(
      user?.firstName,
      user?.lastName,
      user?.email
    ),
    initials: getUserInitials(user?.firstName, user?.lastName, user?.email),
    email: user?.email,
    avatar: user?.avatar,
    isPendingLogout: isPending,
    logout: handleLogout,
  }
}
