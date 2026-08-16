'use server'

import { revalidateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { type ActionState, ApiError, getErrorMessage } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { COOKIE_CONFIG, getCookieOptions } from '@/shared/lib/session-cookies'
import {
  type CreateOrganizationDto,
  CreateOrganizationDtoSchema,
  type Organization,
} from '@/entities/organization'
import { organizationServerApi } from '@/entities/organization/server'

export async function createOrganizationAction(
  dto: CreateOrganizationDto
): Promise<ActionState<Organization>> {
  try {
    const validDto = CreateOrganizationDtoSchema.parse(dto)
    const res = await organizationServerApi.create(validDto)
    const cookieStore = await cookies()

    cookieStore.set(COOKIE_CONFIG.ACTIVE_ORG_ID.name, res.id, {
      ...getCookieOptions(COOKIE_CONFIG.ACTIVE_ORG_ID.maxAge),
      httpOnly: false,
    })

    revalidateTag(SERVER_CACHE_TAGS.organizations)
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
