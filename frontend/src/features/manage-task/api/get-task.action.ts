'use server'

import { z } from 'zod'
import { createOrgAction } from '@/entities/organization/server'
import { taskServerApi } from '@/entities/task/server'

export const getTaskAction = createOrgAction(
  z.object({ id: z.string() }),
  async ({ id }, { activeOrg }) => {
    return taskServerApi.findById(activeOrg.id, id)
  }
)
