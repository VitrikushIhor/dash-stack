'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib/actions/action-builder'
import type { Invitation } from '@/entities/organization'
import { SendInvitationActionSchema } from '../../model/invitation-action.schema'
import { invitationServerApi } from '../invitation-api.server'

export const sendInviteAction = createAction(
  SendInvitationActionSchema,
  async ({ slug, dto }): Promise<Invitation> => {
    const invitation = await invitationServerApi.sendInvite({ slug, dto })

    revalidateTag(SERVER_CACHE_TAGS.orgMembers(slug))

    return invitation
  }
)
