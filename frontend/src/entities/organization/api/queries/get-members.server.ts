import { cache } from 'react'
import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { type Membership } from '@/shared/model'
import { OrganizationSlugSchema } from '../../model/schemas/organization.schema'
import { organizationServerApi } from '../organization-api.server'

type GetOrganizationMembersResponse = {
  data: Membership[] | null
  error: string | null
}

export const getOrganizationMembers = cache(
  async (slug: string): Promise<GetOrganizationMembersResponse> => {
    try {
      const validSlug = OrganizationSlugSchema.parse(slug)
      const data = await organizationServerApi.getMembers(validSlug)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
)
