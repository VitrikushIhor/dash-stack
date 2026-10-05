'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib/actions/action-builder'
import { RevokeInvitationActionSchema } from '../../model/invitation-action.schema'
import { invitationServerApi } from '../invitation-api.server'

export const revokeInviteAction = createAction(
  RevokeInvitationActionSchema,
  async ({ slug, invitationId }): Promise<void> => {
    await invitationServerApi.revokeInvite({ slug, id: invitationId })

    revalidateTag(SERVER_CACHE_TAGS.orgMembers(slug))
  }
)
