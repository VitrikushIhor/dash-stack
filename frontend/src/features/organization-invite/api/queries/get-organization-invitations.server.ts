import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { OrganizationSlugSchema } from '@/entities/organization'
import { invitationServerApi } from '../invitation-api.server'

export const getOrganizationInvitations = cache(
  createServerQuery(
    'getOrganizationInvitations',
    OrganizationSlugSchema,
    (slug) => invitationServerApi.listPending(slug)
  )
)
