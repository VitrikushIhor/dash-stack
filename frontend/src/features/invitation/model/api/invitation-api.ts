import { api } from '@/shared/api/api-client'
import { type Membership } from '@/features/organization/model/types/organization.types'
import {
  type Invitation,
  type CreateInvitationDto,
} from '../types/invitation.types'

export const invitationApi = {
  sendInvite: ({ orgId, dto }: { orgId: string; dto: CreateInvitationDto }) =>
    api.post<Invitation>(`/organizations/${orgId}/invitations`, dto),

  listPending: (orgId: string) =>
    api.get<Invitation[]>(`/organizations/${orgId}/invitations`),

  revokeInvite: ({ orgId, id }: { orgId: string; id: string }) =>
    api.delete(`/organizations/${orgId}/invitations/${id}`),

  acceptInvite: (token: string) =>
    api.post<Membership>(`/invitations/${token}/accept`),
}
