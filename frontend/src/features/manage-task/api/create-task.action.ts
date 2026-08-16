'use server'

import { revalidateTag } from 'next/cache'
import { SERVER_CACHE_TAGS } from '@/shared/config'
import { createOrgAction } from '@/entities/organization/server'
import { CreateTaskDtoSchema } from '@/entities/task'
import { taskServerApi } from '@/entities/task/server'

export const createTaskAction = createOrgAction(
  CreateTaskDtoSchema,
  async (dto, { activeOrg }) => {
    const res = await taskServerApi.create(activeOrg.id, dto)
    revalidateTag(SERVER_CACHE_TAGS.tasks(activeOrg.id))
    return res
  }
)
