import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { organizationServerApi } from '../organization-api.server'
import { GetMemberQuerySchema } from './get-member.schema'

export const getMember = cache(
  createServerQuery('getMember', GetMemberQuerySchema, ({ slug, userId }) =>
    organizationServerApi.getMember({ slug, userId })
  )
)
