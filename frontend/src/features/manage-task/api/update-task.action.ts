'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createOrgAction } from '@/shared/lib/actions/org-action-builder'
import { UpdateTaskDtoSchema } from '@/entities/task'
import { taskServerApi } from '@/entities/task/server'

export const updateTaskAction = createOrgAction(
  z.object({ id: z.string(), data: UpdateTaskDtoSchema }),
  async ({ id, data }, { activeOrg }) => {
    const res = await taskServerApi.update(activeOrg.id, id, data)
    revalidateTag(SERVER_CACHE_TAGS.tasks(activeOrg.id))
    revalidateTag(SERVER_CACHE_TAGS.taskDetail(id))
    return res
  }
)
