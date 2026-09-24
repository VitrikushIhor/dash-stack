'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { labelServerApi } from '@/entities/label/server'
import { CreateLabelActionSchema } from '../model/manage-label-action.schema'

export const createLabelAction = createAction(
  CreateLabelActionSchema,
  async ({ slug, data }) => {
    const res = await labelServerApi.create(slug, data)

    revalidateTag(SERVER_CACHE_TAGS.labels(slug))

    return res
  }
)
