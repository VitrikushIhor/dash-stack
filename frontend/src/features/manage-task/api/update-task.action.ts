'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { OrganizationSlugSchema } from '@/entities/organization'
import { TaskIdSchema, UpdateTaskDtoSchema } from '@/entities/task'
import { taskServerApi } from '@/entities/task/server'

export const updateTaskAction = createAction(
  z.object({
    slug: OrganizationSlugSchema,
    id: TaskIdSchema,
    data: UpdateTaskDtoSchema,
  }),
  async ({ slug, id, data }) => {
    const res = await taskServerApi.update(slug, id, data)
    revalidateTag(SERVER_CACHE_TAGS.tasks(slug))
    revalidateTag(SERVER_CACHE_TAGS.taskDetail(id))
    return res
  }
)
