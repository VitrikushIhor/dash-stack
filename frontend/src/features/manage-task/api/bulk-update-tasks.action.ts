'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createOrgAction } from '@/shared/lib/actions/org-action-builder'
import { BulkUpdateTasksDtoSchema } from '@/entities/task'
import { taskServerApi } from '@/entities/task/server'

export const bulkUpdateTasksAction = createOrgAction(
  BulkUpdateTasksDtoSchema,
  async ({ ids, data }, { activeOrg }) => {
    await taskServerApi.bulkUpdate(activeOrg.id, ids, data)
    revalidateTag(SERVER_CACHE_TAGS.tasks(activeOrg.id))
  }
)
