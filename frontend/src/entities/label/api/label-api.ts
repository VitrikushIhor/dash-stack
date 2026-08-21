import { type HttpClient } from '@/shared/api'
import {
  type CreateLabelDto,
  type LabelDto,
  type UpdateLabelDto,
} from '../model/label.schema'

export function createLabelApi(client: HttpClient) {
  return {
    findAll: (slug: string) => {
      return client.get<LabelDto[]>(`/organizations/${slug}/labels`)
    },
    create: (slug: string, data: CreateLabelDto) => {
      return client.post<LabelDto>(`/organizations/${slug}/labels`, data)
    },
    update: (slug: string, id: string, data: UpdateLabelDto) => {
      return client.patch<LabelDto>(`/organizations/${slug}/labels/${id}`, data)
    },
    delete: (slug: string, id: string) => {
      return client.delete<void>(`/organizations/${slug}/labels/${id}`)
    },
  }
}
