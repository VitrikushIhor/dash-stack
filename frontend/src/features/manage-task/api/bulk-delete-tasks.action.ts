'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createOrgAction } from '@/entities/organization/server'
import { BulkDeleteTasksDtoSchema } from '@/entities/task'
import { taskServerApi } from '@/entities/task/server'

export const bulkDeleteTasksAction = createOrgAction(
  BulkDeleteTasksDtoSchema,
  async (ids, { activeOrg }) => {
    await taskServerApi.bulkDelete(activeOrg.id, ids)
    revalidateTag(SERVER_CACHE_TAGS.tasks(activeOrg.id))
    return ids.length
  }
)
