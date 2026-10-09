import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { OrganizationSlugSchema } from '@/shared/model'
import { labelServerApi } from '../label-api.server'

export const getOrganizationLabels = cache(
  createServerQuery('getOrganizationLabels', OrganizationSlugSchema, (slug) =>
    labelServerApi.findAll(slug)
  )
)
