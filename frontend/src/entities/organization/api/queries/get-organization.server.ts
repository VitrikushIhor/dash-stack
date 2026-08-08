import { cache } from 'react'
import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { serverApi } from '@/shared/api/server-api-client'
import { type Organization } from '../../model/types/organization.types'

type GetOrganizationResponse = {
  data: Organization | null
  error: string | null
}

export const getOrganization = cache(
  async (orgId: string): Promise<GetOrganizationResponse> => {
    try {
      const data = await serverApi.get<Organization>(`/organizations/${orgId}`)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
)
