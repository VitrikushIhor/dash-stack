import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { organizationServerApi } from '../organization-api.server'

export const getUserOrganizations = cache(
  createServerQuery('getUserOrganizations', () =>
    organizationServerApi.getMyMemberships()
  )
)
