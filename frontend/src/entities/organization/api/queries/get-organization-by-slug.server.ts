import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { OrganizationSlugSchema } from '../../model/schemas/organization.schema'
import { organizationServerApi } from '../organization-api.server'

export const getOrganizationBySlug = cache(
  createServerQuery('getOrganizationBySlug', OrganizationSlugSchema, (slug) =>
    organizationServerApi.getBySlug(slug)
  )
)
