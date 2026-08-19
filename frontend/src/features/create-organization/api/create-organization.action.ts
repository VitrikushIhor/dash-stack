'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import {
  CreateOrganizationDtoSchema,
  type Organization,
} from '@/entities/organization'
import { organizationServerApi } from '@/entities/organization/server'

export const createOrganizationAction = createAction(
  CreateOrganizationDtoSchema,
  async (dto): Promise<Organization> => {
    const res = await organizationServerApi.create(dto)
    revalidateTag(SERVER_CACHE_TAGS.organizations)
    return res
  }
)
