import { type HttpClient } from '@/shared/api'
import { type Membership } from '@/shared/model'
import {
  type CreateInvitationDto,
  type Invitation,
} from '@/entities/organization'

export const createInvitationApi = (client: HttpClient) => ({
  sendInvite: ({ slug, dto }: { slug: string; dto: CreateInvitationDto }) =>
    client.post<Invitation>(`/organizations/${slug}/invitations`, dto),

  listPending: (slug: string) =>
    client.get<Invitation[]>(`/organizations/${slug}/invitations`),

  revokeInvite: ({ slug, id }: { slug: string; id: string }) =>
    client.delete<{ message: string }>(
      `/organizations/${slug}/invitations/${id}`
    ),

  acceptInvite: (token: string) =>
    client.post<Membership>(`/invitations/${token}/accept`),
})
