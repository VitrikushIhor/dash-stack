'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib/actions/action-builder'
import type { Membership } from '@/shared/model'
import { AcceptInvitationActionSchema } from '../../model/invitation-action.schema'
import { invitationServerApi } from '../invitation-api.server'

export const acceptInviteAction = createAction(
  AcceptInvitationActionSchema,
  async (token): Promise<Membership> => {
    const result = await invitationServerApi.acceptInvite(token)

    revalidateTag(SERVER_CACHE_TAGS.organizations)

    const slug = result?.organization?.slug

    if (slug) {
      revalidateTag(SERVER_CACHE_TAGS.orgDetail(slug))
      revalidateTag(SERVER_CACHE_TAGS.orgMembers(slug))
    }

    return result
  }
)
