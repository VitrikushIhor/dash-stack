'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { taskServerApi } from '@/entities/task/server'
import { CreateTaskActionSchema } from '../model/manage-task-action.schema'

export const createTaskAction = createAction(
  CreateTaskActionSchema,
  async ({ slug, data }) => {
    const res = await taskServerApi.create(slug, data)

    revalidateTag(SERVER_CACHE_TAGS.tasks(slug))

    return res
  }
)
