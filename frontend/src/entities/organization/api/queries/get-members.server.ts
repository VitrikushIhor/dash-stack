import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { OrganizationSlugSchema } from '../../model/schemas/organization.schema'
import { organizationServerApi } from '../organization-api.server'

export const getOrganizationMembers = cache(
  createServerQuery('getOrganizationMembers', OrganizationSlugSchema, (slug) =>
    organizationServerApi.getMembers(slug)
  )
)
