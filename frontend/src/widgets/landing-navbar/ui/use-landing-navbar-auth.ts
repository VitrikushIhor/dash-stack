'use client'

import { getUserDisplayName, getUserInitials } from '@/shared/lib/utils'
import { useIsAuthenticated } from '@/entities/session'
import { useCurrentUser } from '@/entities/user'
import { useLogout } from '@/features/auth'

export interface NavbarAuthViewModel {
  isAuthenticated: boolean
  isLoading: boolean
  displayName: string
  initials: string
  email: string | undefined
  avatar: string | null | undefined
  isPendingLogout: boolean
  logout: () => void
}

export function useLandingNavbarAuth(): NavbarAuthViewModel {
  const { isAuthenticated, isLoading } = useIsAuthenticated()
  const { data: user } = useCurrentUser()
  const logoutMutation = useLogout()

  return {
    isAuthenticated,
    isLoading,
    displayName: getUserDisplayName(
      user?.firstName,
      user?.lastName,
      user?.email
    ),
    initials: getUserInitials(user?.firstName, user?.lastName, user?.email),
    email: user?.email,
    avatar: user?.avatar,
    isPendingLogout: logoutMutation.isPending,
    logout: () => logoutMutation.mutate(),
  }
}
