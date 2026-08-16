'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createOrgAction } from '@/entities/organization/server'
import { taskServerApi } from '@/entities/task/server'

export const deleteTaskAction = createOrgAction(
  z.object({ id: z.string() }),
  async ({ id }, { activeOrg }) => {
    await taskServerApi.delete(activeOrg.id, id)
    revalidateTag(SERVER_CACHE_TAGS.tasks(activeOrg.id))
  }
)
