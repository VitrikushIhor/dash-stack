'use server'

import { revalidateTag } from 'next/cache'
import { getErrorMessage, ApiError, type ActionState } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import {
  OrganizationIdSchema,
  InvitationIdSchema,
} from '@/entities/organization'
import { invitationServerApi } from '../invitation-api.server'

export async function revokeInviteAction(
  orgId: string,
  invitationId: string
): Promise<ActionState> {
  try {
    const validOrgId = OrganizationIdSchema.parse(orgId)
    const validInvitationId = InvitationIdSchema.parse(invitationId)

    await invitationServerApi.revokeInvite({
      orgId: validOrgId,
      id: validInvitationId,
    })

    revalidateTag(SERVER_CACHE_TAGS.orgMembers(orgId))

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
