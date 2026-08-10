import { cache } from 'react'
import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { type Membership } from '@/shared/model'
import { OrganizationIdSchema } from '../../model/schemas/organization.schema'
import { organizationServerApi } from '../organization-api.server'

type GetOrganizationMembersResponse = {
  data: Membership[] | null
  error: string | null
}

export const getOrganizationMembers = cache(
  async (orgId: string): Promise<GetOrganizationMembersResponse> => {
    try {
      const validOrgId = OrganizationIdSchema.parse(orgId)
      const data = await organizationServerApi.getMembers(validOrgId)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
)
