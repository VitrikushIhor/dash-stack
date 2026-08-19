'use server'

import { revalidateTag } from 'next/cache'
import { type ActionState, ApiError, getErrorMessage } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import {
  type Organization,
  OrganizationSlugSchema,
  type UpdateOrganizationDto,
  UpdateOrganizationDtoSchema,
} from '@/entities/organization'
import { organizationServerApi } from '@/entities/organization/server'

export async function updateOrganizationAction(
  slug: string,
  dto: UpdateOrganizationDto
): Promise<ActionState<Organization>> {
  try {
    const validSlug = OrganizationSlugSchema.parse(slug)
    const validDto = UpdateOrganizationDtoSchema.parse(dto)

    const res = await organizationServerApi.update({
      slug: validSlug,
      dto: validDto,
    })
    revalidateTag(SERVER_CACHE_TAGS.organizations)
    revalidateTag(SERVER_CACHE_TAGS.orgDetail(validSlug))
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
