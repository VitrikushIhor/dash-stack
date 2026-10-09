'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { taskServerApi } from '@/entities/task/server'
import { BulkUpdateTasksActionSchema } from '../model/manage-task-action.schema'

export const bulkUpdateTasksAction = createAction(
  BulkUpdateTasksActionSchema,
  async ({ slug, ids, data }) => {
    const res = await taskServerApi.bulkUpdate(slug, ids, data)

    revalidateTag(SERVER_CACHE_TAGS.tasks(slug))

    return res
  }
)
