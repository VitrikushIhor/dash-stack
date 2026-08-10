'use server'

import { revalidateTag } from 'next/cache'
import { getErrorMessage, ApiError, type ActionState } from '@/shared/api'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import {
  type UpdateOrganizationDto,
  type Organization,
  OrganizationIdSchema,
  UpdateOrganizationDtoSchema,
} from '@/entities/organization'
import { organizationServerApi } from '@/entities/organization/server'

export async function updateOrganizationAction(
  orgId: string,
  dto: UpdateOrganizationDto
): Promise<ActionState<Organization>> {
  try {
    const validOrgId = OrganizationIdSchema.parse(orgId)
    const validDto = UpdateOrganizationDtoSchema.parse(dto)

    const res = await organizationServerApi.update({
      orgId: validOrgId,
      dto: validDto,
    })
    revalidateTag(SERVER_CACHE_TAGS.organizations)
    revalidateTag(SERVER_CACHE_TAGS.orgDetail(orgId))
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
