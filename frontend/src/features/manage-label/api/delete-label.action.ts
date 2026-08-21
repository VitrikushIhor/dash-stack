'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { LabelIdSchema } from '@/entities/label'
import { labelServerApi } from '@/entities/label/server'
import { OrganizationSlugSchema } from '@/entities/organization'

export const deleteLabelAction = createAction(
  z.object({
    slug: OrganizationSlugSchema,
    id: LabelIdSchema,
  }),
  async ({ slug, id }) => {
    await labelServerApi.delete(slug, id)
    revalidateTag(SERVER_CACHE_TAGS.labels(slug))
    return true
  }
)
