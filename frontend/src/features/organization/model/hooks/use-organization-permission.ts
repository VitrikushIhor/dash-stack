import { useMemo } from 'react'
import { OrgRole } from '@/shared/model/types/org-role'
import { useCurrentUser } from '@/features/auth'
import { type Organization } from '../types/organization.types'

export const useOrganizationPermission = (
  organization?: Organization | null
) => {
  const { data: user, isLoading: isAuthLoading } = useCurrentUser()

  const currentUserMembership = useMemo(() => {
    const memberships = organization?.memberships
    if (!memberships || !Array.isArray(memberships) || !user?.id) {
      return undefined
    }

    const targetId = String(user.id).trim()
    const targetEmail = String(user.email).trim().toLowerCase()

    return memberships.find((m) => {
      const mUserId = m.userId ? String(m.userId).trim() : null
      const mUserInnerId = m.user?.id ? String(m.user?.id).trim() : null
      const mUserEmail = m.user?.email
        ? String(m.user?.email).trim().toLowerCase()
        : null

      return (
        mUserId === targetId ||
        mUserInnerId === targetId ||
        (mUserEmail && mUserEmail === targetEmail)
      )
    })
  }, [organization?.memberships, user])

  const role = currentUserMembership?.role
  const isOwner = role === OrgRole.OWNER
  const isAdmin = role === OrgRole.ADMIN
  const canManage = isOwner || isAdmin

  const isLoading = organization === undefined || isAuthLoading

  return {
    membership: currentUserMembership,
    isAdmin,
    isOwner,
    canManage,
    role,
    isLoading,
  }
}
