'use server'

import { revalidateTag } from 'next/cache'
import { type ActionState, ApiError, getErrorMessage } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { OrganizationSlugSchema } from '@/entities/organization'
import { organizationServerApi } from '@/entities/organization/server'

export async function deleteOrganizationAction(
  slug: string
): Promise<ActionState<{ message: string }>> {
  try {
    const validSlug = OrganizationSlugSchema.parse(slug)
    const res = await organizationServerApi.delete(validSlug)

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
