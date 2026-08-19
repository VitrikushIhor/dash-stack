'use server'

import { revalidateTag } from 'next/cache'
import { type ActionState, ApiError, getErrorMessage } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import {
  type CreateInvitationDto,
  type Invitation,
  OrganizationSlugSchema,
  SendInviteDtoSchema,
} from '@/entities/organization'
import { invitationServerApi } from '../invitation-api.server'

export async function sendInviteAction(
  slug: string,
  dto: CreateInvitationDto
): Promise<ActionState<Invitation>> {
  try {
    const validSlug = OrganizationSlugSchema.parse(slug)
    const validDto = SendInviteDtoSchema.parse(dto)

    const res = await invitationServerApi.sendInvite({
      slug: validSlug,
      dto: validDto,
    })

    revalidateTag(SERVER_CACHE_TAGS.orgMembers(validSlug))

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
