'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { type Organization } from '@/entities/organization'
import { organizationServerApi } from '@/entities/organization/server'
import { UpdateOrganizationActionSchema } from '../model/update-organization.schema'

export const updateOrganizationAction = createAction(
  UpdateOrganizationActionSchema,
  async ({ slug, dto }): Promise<Organization> => {
    const res = await organizationServerApi.update({ slug, dto })

    revalidateTag(SERVER_CACHE_TAGS.organizations)
    revalidateTag(SERVER_CACHE_TAGS.orgDetail(slug))

    return res
  }
)
