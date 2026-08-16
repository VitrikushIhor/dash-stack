import { OrgRole } from '@/shared/model'
import { useCurrentUser } from '@/entities/user'
import { type Organization } from '../types/organization.types'

export const useOrganizationPermission = (
  organization?: Organization | null
) => {
  const { isLoading: isAuthLoading } = useCurrentUser()

  const role = organization?.currentUserRole ?? undefined
  const isOwner = role === OrgRole.OWNER
  const isAdmin = role === OrgRole.ADMIN
  const canManage = isOwner || isAdmin
  const isMember = !!role

  const isLoading = organization === undefined || isAuthLoading

  return {
    role,
    isOwner,
    isAdmin,
    canManage,
    isMember,
    isLoading,
  }
}
