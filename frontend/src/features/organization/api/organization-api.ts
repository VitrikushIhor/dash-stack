import { api } from '@/shared/api/api-client'
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

  delete: (orgId: string) => api.delete(`/organizations/${orgId}`),
}
