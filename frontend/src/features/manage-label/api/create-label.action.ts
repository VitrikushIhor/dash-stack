'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { CreateLabelDtoSchema } from '@/entities/label'
import { labelServerApi } from '@/entities/label/server'
import { OrganizationSlugSchema } from '@/entities/organization'

export const createLabelAction = createAction(
  z.object({
    slug: OrganizationSlugSchema,
    data: CreateLabelDtoSchema,
  }),
  async ({ slug, data }) => {
    const res = await labelServerApi.create(slug, data)
    revalidateTag(SERVER_CACHE_TAGS.labels(slug))
    return res
  }
)
