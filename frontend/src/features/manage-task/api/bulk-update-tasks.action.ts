'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { OrganizationSlugSchema } from '@/entities/organization'
import { BulkUpdateTasksDtoSchema } from '@/entities/task'
import { taskServerApi } from '@/entities/task/server'

export const bulkUpdateTasksAction = createAction(
  z.object({
    slug: OrganizationSlugSchema,
    ids: BulkUpdateTasksDtoSchema.shape.ids,
    data: BulkUpdateTasksDtoSchema.shape.data,
  }),
  async ({ slug, ids, data }) => {
    const res = await taskServerApi.bulkUpdate(slug, ids, data)
    revalidateTag(SERVER_CACHE_TAGS.tasks(slug))
    return res
  }
)
