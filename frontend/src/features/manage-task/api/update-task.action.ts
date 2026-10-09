'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { taskServerApi } from '@/entities/task/server'
import { UpdateTaskActionSchema } from '../model/manage-task-action.schema'

export const updateTaskAction = createAction(
  UpdateTaskActionSchema,
  async ({ slug, id, data }) => {
    const res = await taskServerApi.update(slug, id, data)

    revalidateTag(SERVER_CACHE_TAGS.tasks(slug))
    revalidateTag(SERVER_CACHE_TAGS.taskDetail(id))

    return res
  }
)
