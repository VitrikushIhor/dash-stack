'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { labelServerApi } from '@/entities/label/server'
import { DeleteLabelActionSchema } from '../model/manage-label-action.schema'

export const deleteLabelAction = createAction(
  DeleteLabelActionSchema,
  async ({ slug, id }) => {
    await labelServerApi.delete(slug, id)
    revalidateTag(SERVER_CACHE_TAGS.labels(slug))

    return true
  }
)
