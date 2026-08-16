import { type HttpClient } from '@/shared/api'
import { type Membership } from '@/shared/model'
import {
  type CreateInvitationDto,
  type Invitation,
} from '@/entities/organization'

export const createInvitationApi = (client: HttpClient) => ({
  sendInvite: ({ orgId, dto }: { orgId: string; dto: CreateInvitationDto }) =>
    client.post<Invitation>(`/organizations/${orgId}/invitations`, dto),

  listPending: (orgId: string) =>
    client.get<Invitation[]>(`/organizations/${orgId}/invitations`),

  revokeInvite: ({ orgId, id }: { orgId: string; id: string }) =>
    client.delete<{ message: string }>(
      `/organizations/${orgId}/invitations/${id}`
    ),

  acceptInvite: (token: string) =>
    client.post<Membership>(`/invitations/${token}/accept`),
})
