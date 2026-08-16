import { type HttpClient } from '@/shared/api'
import {
  type LabelDto,
  type CreateLabelDto,
  type UpdateLabelDto,
} from '../model/label.schema'

export function createLabelApi(client: HttpClient) {
  return {
    findAll: (orgId: string) => {
      return client.get<LabelDto[]>(`/organizations/${orgId}/labels`)
    },
    create: (orgId: string, data: CreateLabelDto) => {
      return client.post<LabelDto>(`/organizations/${orgId}/labels`, data)
    },
    update: (orgId: string, id: string, data: UpdateLabelDto) => {
      return client.patch<LabelDto>(
        `/organizations/${orgId}/labels/${id}`,
        data
      )
    },
    delete: (orgId: string, id: string) => {
      return client.delete<void>(`/organizations/${orgId}/labels/${id}`)
    },
  }
}
