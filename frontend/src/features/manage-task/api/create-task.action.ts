'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { OrganizationSlugSchema } from '@/entities/organization'
import { CreateTaskDtoSchema } from '@/entities/task'
import { taskServerApi } from '@/entities/task/server'

export const createTaskAction = createAction(
  z.object({
    slug: OrganizationSlugSchema,
    data: CreateTaskDtoSchema,
  }),
  async ({ slug, data }) => {
    const res = await taskServerApi.create(slug, data)
    revalidateTag(SERVER_CACHE_TAGS.tasks(slug))
    return res
  }
)
