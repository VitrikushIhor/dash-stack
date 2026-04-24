import { type OrgRole } from '@/shared/model/types/org-role'

export interface Invitation {
  id: string
  email: string
  orgId: string
  role: OrgRole
  token: string
  expiresAt: string
  invitedBy: string
  acceptedAt?: string
  createdAt: string
}

export interface CreateInvitationDto {
  email: string
  role: OrgRole
}
