import { cache } from 'react'
import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { serverApi } from '@/shared/api/server-api-client'
import { type Membership } from '@/shared/model'

type GetOrganizationMembersResponse = {
  data: Membership[] | null
  error: string | null
}

export const getOrganizationMembers = cache(
  async (orgId: string): Promise<GetOrganizationMembersResponse> => {
    try {
      const data = await serverApi.get<Membership[]>(
        `/organizations/${orgId}/members`
      )
      return { data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
)
