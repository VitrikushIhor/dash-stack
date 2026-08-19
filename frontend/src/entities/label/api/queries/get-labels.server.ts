import { cache } from 'react'
import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { type LabelDto } from '../../model/label.schema'
import { labelServerApi } from '../label-api.server'

type GetOrganizationLabelsResponse = {
  data: LabelDto[] | null
  error: string | null
}

export const getOrganizationLabels = cache(
  async (slug: string): Promise<GetOrganizationLabelsResponse> => {
    try {
      const data = await labelServerApi.findAll(slug)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
)
