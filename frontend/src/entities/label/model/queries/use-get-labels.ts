import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { api } from '@/shared/api'
import { createLabelApi } from '../../api/label-api'
import { type Label } from '../types'
import { LABEL_QUERY_KEYS } from './label-query-keys'

const labelApi = createLabelApi(api)

export const useGetLabels = (
  orgId: string,
  options?: Omit<UseQueryOptions<Label[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: LABEL_QUERY_KEYS.lists(orgId),
    queryFn: async () => {
      const data = await labelApi.findAll(orgId)
      return data.map((dto) => ({
        id: dto.id,
        name: dto.name,
        color: dto.color,
      }))
    },
    enabled: Boolean(orgId),
    ...options,
  })
}
