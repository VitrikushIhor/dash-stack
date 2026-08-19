'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { OrganizationSlugSchema } from '@/entities/organization'
import { TaskIdSchema } from '@/entities/task'
import { taskServerApi } from '@/entities/task/server'

export const deleteTaskAction = createAction(
  z.object({
    slug: OrganizationSlugSchema,
    id: TaskIdSchema,
  }),
  async ({ slug, id }) => {
    const res = await taskServerApi.delete(slug, id)
    revalidateTag(SERVER_CACHE_TAGS.tasks(slug))
    revalidateTag(SERVER_CACHE_TAGS.taskDetail(id))
    return res
  }
)
