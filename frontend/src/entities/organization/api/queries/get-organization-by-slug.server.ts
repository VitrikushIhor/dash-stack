import { cache } from 'react'
import 'server-only'
import { getErrorMessage } from '@/shared/api'
import { OrganizationSlugSchema } from '../../model/schemas/organization.schema'
import { type Organization } from '../../model/types/organization.types'
import { getOrganization } from './get-organization.server'

type GetOrganizationBySlugResponse = {
  data: Organization | null
  error: string | null
}

export const getOrganizationBySlug = cache(
  async (slug: string): Promise<GetOrganizationBySlugResponse> => {
    try {
      const validSlug = OrganizationSlugSchema.parse(slug)

      const orgResult = await getOrganization(validSlug)
      if (orgResult.error || !orgResult.data) {
        return {
          data: null,
          error: orgResult.error ?? 'Organization not found or access denied',
        }
      }

      return {
        data: orgResult.data,
        error: null,
      }
    } catch (error) {
      return { data: null, error: getErrorMessage(error) }
    }
  }
)
