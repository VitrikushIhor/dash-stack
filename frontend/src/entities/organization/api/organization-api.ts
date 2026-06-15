import { api } from '@/shared/api'
import { type Membership } from '@/shared/model'
import {
  type Organization,
  type CreateOrganizationDto,
  type UpdateOrganizationDto,
} from '../model/types/organization.types'

export const organizationApi = {
  getAll: () => api.get<Organization[]>('/organizations'),

  getById: (orgId: string) => api.get<Organization>(`/organizations/${orgId}`),

  create: (dto: CreateOrganizationDto) =>
    api.post<Organization>('/organizations', dto),

  update: ({ orgId, dto }: { orgId: string; dto: UpdateOrganizationDto }) =>
    api.patch<Organization>(`/organizations/${orgId}`, dto),

  delete: (orgId: string) =>
    api.delete<{ message: string }>(`/organizations/${orgId}`),

  getMembers: (orgId: string) =>
    api.get<Membership[]>(`/organizations/${orgId}/members`),

  getMember: ({ orgId, userId }: { orgId: string; userId: string }) =>
    api.get<Membership>(`/organizations/${orgId}/members/${userId}`),
}
