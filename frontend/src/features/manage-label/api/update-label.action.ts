'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { labelServerApi } from '@/entities/label/server'
import { UpdateLabelActionSchema } from '../model/manage-label-action.schema'

export const updateLabelAction = createAction(
  UpdateLabelActionSchema,
  async ({ slug, id, data }) => {
    const res = await labelServerApi.update(slug, id, data)

    revalidateTag(SERVER_CACHE_TAGS.labels(slug))

    return res
  }
)
