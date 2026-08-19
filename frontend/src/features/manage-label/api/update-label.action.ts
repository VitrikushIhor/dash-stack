'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { LabelIdSchema, UpdateLabelDtoSchema } from '@/entities/label'
import { labelServerApi } from '@/entities/label/server'
import { OrganizationSlugSchema } from '@/entities/organization'

export const updateLabelAction = createAction(
  z.object({
    slug: OrganizationSlugSchema,
    id: LabelIdSchema,
    data: UpdateLabelDtoSchema,
  }),
  async ({ slug, id, data }) => {
    const res = await labelServerApi.update(slug, id, data)
    revalidateTag(SERVER_CACHE_TAGS.labels(slug))
    return res
  }
)
