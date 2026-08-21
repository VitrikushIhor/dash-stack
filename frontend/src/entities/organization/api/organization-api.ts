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

  getBySlug: (slug: string) =>
    client.get<Organization>(`/organizations/${slug}`),

  create: (dto: CreateOrganizationDto) =>
    client.post<Organization>('/organizations', dto),

  update: ({ slug, dto }: { slug: string; dto: UpdateOrganizationDto }) =>
    client.patch<Organization>(`/organizations/${slug}`, dto),

  delete: (slug: string) =>
    client.delete<{ message: string }>(`/organizations/${slug}`),

  getMembers: (slug: string) =>
    client.get<Membership[]>(`/organizations/${slug}/members`),

  getMember: ({ slug, userId }: { slug: string; userId: string }) =>
    client.get<Membership>(`/organizations/${slug}/members/${userId}`),
})

export const organizationApi = createOrganizationApi(api)
