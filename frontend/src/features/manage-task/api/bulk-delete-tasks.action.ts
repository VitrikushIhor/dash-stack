'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { OrganizationSlugSchema } from '@/entities/organization'
import { BulkDeleteTasksDtoSchema } from '@/entities/task'
import { taskServerApi } from '@/entities/task/server'

export const bulkDeleteTasksAction = createAction(
  z.object({
    slug: OrganizationSlugSchema,
    ids: BulkDeleteTasksDtoSchema,
  }),
  async ({ slug, ids }) => {
    const res = await taskServerApi.bulkDelete(slug, ids)
    revalidateTag(SERVER_CACHE_TAGS.tasks(slug))
    return res
  }
)
