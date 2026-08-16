import { type HttpClient, api } from '@/shared/api'
import { type Membership } from '@/shared/model'
import {
  type CreateOrganizationDto,
  type Organization,
  type UpdateOrganizationDto,
  type UserMembership,
} from '../model/types/organization.types'

export const createOrganizationApi = (client: HttpClient) => ({
  getAll: () => client.get<Organization[]>('/organizations'),

  getMyMemberships: () => client.get<UserMembership[]>('/me/memberships'),

  getById: (orgId: string) =>
    client.get<Organization>(`/organizations/${orgId}`),

  create: (dto: CreateOrganizationDto) =>
    client.post<Organization>('/organizations', dto),

  update: ({ orgId, dto }: { orgId: string; dto: UpdateOrganizationDto }) =>
    client.patch<Organization>(`/organizations/${orgId}`, dto),

  delete: (orgId: string) =>
    client.delete<{ message: string }>(`/organizations/${orgId}`),

  getMembers: (orgId: string) =>
    client.get<Membership[]>(`/organizations/${orgId}/members`),

  getMember: ({ orgId, userId }: { orgId: string; userId: string }) =>
    client.get<Membership>(`/organizations/${orgId}/members/${userId}`),
})

export const organizationApi = createOrganizationApi(api)
