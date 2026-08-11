'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createOrgAction } from '@/shared/lib/actions/org-action-builder'
import { CreateLabelDtoSchema } from '@/entities/label'
import { labelServerApi } from '@/entities/label/server'

export const createLabelAction = createOrgAction(
  CreateLabelDtoSchema,
  async (dto, { activeOrg }) => {
    const res = await labelServerApi.create(activeOrg.id, dto)
    revalidateTag(SERVER_CACHE_TAGS.labels(activeOrg.id))
    return res
  }
)
