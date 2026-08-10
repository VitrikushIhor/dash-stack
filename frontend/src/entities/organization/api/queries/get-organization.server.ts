import { cache } from 'react'
import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { OrganizationIdSchema } from '../../model/schemas/organization.schema'
import { type Organization } from '../../model/types/organization.types'
import { organizationServerApi } from '../organization-api.server'

type GetOrganizationResponse = {
  data: Organization | null
  error: string | null
}

export const getOrganization = cache(
  async (orgId: string): Promise<GetOrganizationResponse> => {
    try {
      const validOrgId = OrganizationIdSchema.parse(orgId)
      const data = await organizationServerApi.getById(validOrgId)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
)
