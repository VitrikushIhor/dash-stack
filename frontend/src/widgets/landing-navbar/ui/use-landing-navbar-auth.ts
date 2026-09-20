'use client'

import { getUserDisplayName, getUserInitials } from '@/shared/lib/utils'
import { useCurrentUser } from '@/entities/user'
import { useLogout } from '@/features/auth'

interface NavbarAuthViewModel {
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
  const { data: user, isLoading } = useCurrentUser()
  const { handleLogout, isPending } = useLogout()

  return {
    isAuthenticated: !!user,
    isLoading,

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
