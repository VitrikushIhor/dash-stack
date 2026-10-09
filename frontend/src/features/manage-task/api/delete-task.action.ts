'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { taskServerApi } from '@/entities/task/server'
import { TaskByIdActionSchema } from '../model/manage-task-action.schema'

export const deleteTaskAction = createAction(
  TaskByIdActionSchema,
  async ({ slug, id }) => {
    const res = await taskServerApi.delete(slug, id)

    revalidateTag(SERVER_CACHE_TAGS.tasks(slug))
    revalidateTag(SERVER_CACHE_TAGS.taskDetail(id))

    return res
  }
)
