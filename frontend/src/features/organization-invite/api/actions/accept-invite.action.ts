'use server'

import { revalidateTag } from 'next/cache'
import { type ActionState, ApiError, getErrorMessage } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { type Membership } from '@/shared/model'
import { InvitationTokenSchema } from '@/entities/organization'
import { invitationServerApi } from '../invitation-api.server'

export async function acceptInviteAction(
  token: string
): Promise<ActionState<Membership>> {
  try {
    const validToken = InvitationTokenSchema.parse(token)

    const result = await invitationServerApi.acceptInvite(validToken)

    revalidateTag(SERVER_CACHE_TAGS.organizations)

    if (result?.orgId) {
      revalidateTag(SERVER_CACHE_TAGS.orgDetail(result.orgId))
      revalidateTag(SERVER_CACHE_TAGS.orgMembers(result.orgId))
    }

    return { success: true, data: result }
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        validationMessages: error.validationMessages,
      }
    }
    return { success: false, error: getErrorMessage(error) }
  }
}
