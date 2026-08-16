'use server'

import { z } from 'zod'
import { createOrgAction } from '@/shared/lib/actions/org-action-builder'
import { taskServerApi } from '@/entities/task/server'

export const getTaskAction = createOrgAction(
  z.object({ id: z.string() }),
  async ({ id }, { activeOrg }) => {
    return taskServerApi.findById(activeOrg.id, id)
  }
)
