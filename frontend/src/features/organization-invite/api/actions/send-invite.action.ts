'use server'

import { revalidateTag } from 'next/cache'
import { getErrorMessage, ApiError, type ActionState } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import {
  type Invitation,
  type CreateInvitationDto,
  OrganizationIdSchema,
  SendInviteDtoSchema,
} from '@/entities/organization'
import { invitationServerApi } from '../invitation-api.server'

export async function sendInviteAction(
  orgId: string,
  dto: CreateInvitationDto
): Promise<ActionState<Invitation>> {
  try {
    const validOrgId = OrganizationIdSchema.parse(orgId)
    const validDto = SendInviteDtoSchema.parse(dto)

    const res = await invitationServerApi.sendInvite({
      orgId: validOrgId,
      dto: validDto,
    })

    revalidateTag(SERVER_CACHE_TAGS.orgMembers(orgId))

    return { success: true, data: res }
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
