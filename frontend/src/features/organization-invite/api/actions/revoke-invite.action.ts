'use server'

import { revalidateTag } from 'next/cache'
import { type ActionState, ApiError, getErrorMessage } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import {
  InvitationIdSchema,
  OrganizationSlugSchema,
} from '@/entities/organization'
import { invitationServerApi } from '../invitation-api.server'

export async function revokeInviteAction(
  slug: string,
  invitationId: string
): Promise<ActionState> {
  try {
    const validSlug = OrganizationSlugSchema.parse(slug)
    const validInvitationId = InvitationIdSchema.parse(invitationId)

    await invitationServerApi.revokeInvite({
      slug: validSlug,
      id: validInvitationId,
    })

    revalidateTag(SERVER_CACHE_TAGS.orgMembers(validSlug))

    return { success: true, data: undefined }
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
