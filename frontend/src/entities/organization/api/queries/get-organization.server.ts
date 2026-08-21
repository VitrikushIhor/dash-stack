import { cache } from 'react'
import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { OrganizationSlugSchema } from '../../model/schemas/organization.schema'
import { type Organization } from '../../model/types/organization.types'
import { organizationServerApi } from '../organization-api.server'

type GetOrganizationResponse = {
  data: Organization | null
  error: string | null
}

export const getOrganization = cache(
  async (slug: string): Promise<GetOrganizationResponse> => {
    try {
      const validSlug = OrganizationSlugSchema.parse(slug)
      const data = await organizationServerApi.getBySlug(validSlug)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
)
