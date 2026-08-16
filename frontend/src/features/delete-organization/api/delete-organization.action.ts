'use server'

import { revalidateTag } from 'next/cache'
import { getErrorMessage, ApiError, type ActionState } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { OrganizationIdSchema } from '@/entities/organization'
import { organizationServerApi } from '@/entities/organization/server'

export async function deleteOrganizationAction(
  orgId: string
): Promise<ActionState<{ message: string }>> {
  try {
    const validOrgId = OrganizationIdSchema.parse(orgId)
    const res = await organizationServerApi.delete(validOrgId)

    revalidateTag(SERVER_CACHE_TAGS.organizations)
    revalidateTag(SERVER_CACHE_TAGS.orgDetail(validOrgId))
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
