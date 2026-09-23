'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { taskServerApi } from '@/entities/task/server'
import { BulkDeleteTasksActionSchema } from '../model/manage-task-action.schema'

export const bulkDeleteTasksAction = createAction(
  BulkDeleteTasksActionSchema,
  async ({ slug, ids }) => {
    const res = await taskServerApi.bulkDelete(slug, ids)

    revalidateTag(SERVER_CACHE_TAGS.tasks(slug))

    return res
  }
)
