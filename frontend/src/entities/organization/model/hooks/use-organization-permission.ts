import { OrgRole } from '@/shared/model'
import { type Organization } from '../types/organization.types'

export const useOrganizationPermission = (
  organization?: Organization | null
) => {
  const role = organization?.currentUserRole ?? undefined
  const isOwner = role === OrgRole.OWNER
  const isAdmin = role === OrgRole.ADMIN
  const canManage = isOwner || isAdmin
  const isMember = !!role

  const isLoading = organization === undefined

  return {
    role,
    isOwner,
    isAdmin,
    canManage,
    isMember,
    isLoading,
  }
}
